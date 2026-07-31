const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  SettlementProfile,
  SettlementBatch,
  Settlement,
  SettlementItem,
  SettlementAdjustment,
} = require('../models/associations');
const {
  resolvePaymentAccount,
} = require('./paymentAccount.service');
const {
  listEligibleLedgerEntries,
  sumEntries,
} = require('./settlementEligibility.service');
const {
  recordSettlementAudit,
} = require('./settlementAudit.service');
const {
  settlementEvents,
  SETTLEMENT_EVENT,
} = require('../events/settlement.events');

function serviceError(message, status = 400, code = 'SETTLEMENT_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function createSettlementBatch({
  ownerType,
  currency,
  settlementDate,
  createdBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const profiles = await SettlementProfile.findAll({
      where: {
        owner_type: ownerType,
        currency: String(currency).toUpperCase(),
        status: 'active',
        [Op.or]: [
          { next_settlement_at: null },
          { next_settlement_at: { [Op.lte]: new Date(settlementDate) } },
        ],
      },
      transaction,
    });

    const batch = await SettlementBatch.create({
      batch_reference: [
        ownerType.toUpperCase(),
        String(currency).toUpperCase(),
        settlementDate,
        crypto.randomUUID().slice(0, 8).toUpperCase(),
      ].join('-'),
      owner_type: ownerType,
      currency: String(currency).toUpperCase(),
      settlement_date: settlementDate,
      status: 'draft',
    }, { transaction });

    let totalGross = 0;
    let totalAdjustments = 0;
    let totalNet = 0;
    let itemCount = 0;

    for (const profile of profiles) {
      const accountType = ownerType === 'vendor'
        ? 'payable'
        : 'earnings_payable';

      const payableAccount = await resolvePaymentAccount({
        ownerType,
        ownerId: profile.owner_id,
        accountType,
        currency,
        transaction,
      });

      const payoutAccount = await resolvePaymentAccount({
        ownerType,
        ownerId: profile.owner_id,
        accountType: 'payout_clearing',
        currency,
        transaction,
      });

      const entries = await listEligibleLedgerEntries({
        accountId: payableAccount.id,
        holdDays: profile.hold_days,
        settlementDate,
        transaction,
      });

      const grossMinor = sumEntries(entries);

      const adjustments = await SettlementAdjustment.findAll({
        where: {
          owner_type: ownerType,
          owner_id: profile.owner_id,
          currency: String(currency).toUpperCase(),
          status: 'pending',
        },
        transaction,
      });

      const adjustmentsMinor = adjustments.reduce(
        (sum, item) => sum + Number(item.amount_minor),
        0
      );

      const netMinor = grossMinor + adjustmentsMinor;

      if (netMinor < Number(profile.minimum_payout_minor) || netMinor <= 0) {
        continue;
      }

      const settlement = await Settlement.create({
        batch_id: batch.id,
        profile_id: profile.id,
        owner_type: ownerType,
        owner_id: profile.owner_id,
        currency: String(currency).toUpperCase(),
        gross_minor: grossMinor,
        adjustments_minor: adjustmentsMinor,
        fees_minor: 0,
        net_minor: netMinor,
        payable_account_id: payableAccount.id,
        payout_account_id: payoutAccount.id,
        status: 'pending',
      }, { transaction });

      await SettlementItem.bulkCreate(
        entries.map((entry) => ({
          settlement_id: settlement.id,
          source_transaction_id: entry.transaction_id,
          source_entry_id: entry.id,
          order_id: entry.transaction?.order_id || null,
          amount_minor: entry.amount_minor,
          item_type: 'earning',
        })),
        { transaction }
      );

      if (adjustments.length) {
        await SettlementAdjustment.update({
          status: 'applied',
          applied_settlement_id: settlement.id,
        }, {
          where: {
            id: { [Op.in]: adjustments.map((item) => item.id) },
          },
          transaction,
        });
      }

      totalGross += grossMinor;
      totalAdjustments += adjustmentsMinor;
      totalNet += netMinor;
      itemCount += entries.length;
    }

    await batch.update({
      total_gross_minor: totalGross,
      total_adjustments_minor: totalAdjustments,
      total_fees_minor: 0,
      total_net_minor: totalNet,
      item_count: itemCount,
    }, { transaction });

    await recordSettlementAudit({
      batchId: batch.id,
      actorId: createdBy,
      action: 'batch_created',
      newValue: {
        totalGross,
        totalAdjustments,
        totalNet,
        itemCount,
      },
      transaction,
    });

    transaction.afterCommit(() => {
      settlementEvents.emit(SETTLEMENT_EVENT.BATCH_CREATED, {
        batchId: batch.id,
        ownerType,
        currency,
      });
    });

    return batch;
  });
}

async function approveSettlementBatch({
  batchId,
  approverId,
}) {
  const batch = await SettlementBatch.findByPk(batchId);

  if (!batch) {
    throw serviceError('Settlement batch not found', 404, 'BATCH_NOT_FOUND');
  }

  if (batch.status !== 'draft') {
    throw serviceError(
      'Only draft batches can be approved',
      409,
      'INVALID_BATCH_STATUS'
    );
  }

  await batch.update({
    status: 'approved',
    approved_by: approverId,
    approved_at: new Date(),
  });

  await recordSettlementAudit({
    batchId,
    actorId: approverId,
    action: 'batch_approved',
    previousValue: { status: 'draft' },
    newValue: { status: 'approved' },
  });

  settlementEvents.emit(SETTLEMENT_EVENT.BATCH_APPROVED, {
    batchId,
  });

  return batch;
}

module.exports = {
  createSettlementBatch,
  approveSettlementBatch,
};
