const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  MzayaPayout,
  MzayaPayoutItem,
} = require('../models/associations');
const {
  calculateMzayaPayout,
} = require('./mzayaPayoutCalculator.service');
const {
  emitMzayaPayoutDue,
  emitMzayaPayoutPaid,
} = require('./mzayaPayoutFinanceEvents.service');

async function createMzayaPayout({
  mzayaId,
  periodFrom = null,
  periodTo = null,
  currency,
  payoutMethod = null,
  items = [],
  dueAt = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const totals = items.reduce((acc, item) => ({
      deliveryEarningsMinor:
        acc.deliveryEarningsMinor +
        Number(item.deliveryEarningMinor || 0),
      tipsMinor:
        acc.tipsMinor +
        Number(item.tipMinor || 0),
      incentivesMinor:
        acc.incentivesMinor +
        Number(item.incentiveMinor || 0),
      reimbursementsMinor:
        acc.reimbursementsMinor +
        Number(item.reimbursementMinor || 0),
      penaltiesMinor:
        acc.penaltiesMinor +
        Number(item.penaltyMinor || 0),
      withholdingMinor:
        acc.withholdingMinor +
        Number(item.withholdingMinor || 0),
      adjustmentsMinor:
        acc.adjustmentsMinor +
        Number(item.adjustmentMinor || 0),
    }), {
      deliveryEarningsMinor: 0,
      tipsMinor: 0,
      incentivesMinor: 0,
      reimbursementsMinor: 0,
      penaltiesMinor: 0,
      withholdingMinor: 0,
      adjustmentsMinor: 0,
    });

    const calculated = calculateMzayaPayout(totals);

    const payout = await MzayaPayout.create({
      mzaya_id: mzayaId,
      payout_reference:
        `MPO-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      period_from: periodFrom,
      period_to: periodTo,
      currency: String(currency).toUpperCase(),
      payout_method: payoutMethod,
      delivery_earnings_minor: calculated.deliveryEarningsMinor,
      tips_minor: calculated.tipsMinor,
      incentives_minor: calculated.incentivesMinor,
      reimbursements_minor: calculated.reimbursementsMinor,
      penalties_minor: calculated.penaltiesMinor,
      withholding_minor: calculated.withholdingMinor,
      adjustments_minor: calculated.adjustmentsMinor,
      amount_due_minor: calculated.amountDueMinor,
      due_at: dueAt,
      status: 'draft',
    }, { transaction });

    if (items.length) {
      await MzayaPayoutItem.bulkCreate(
        items.map((item) => ({
          payout_id: payout.id,
          order_id: item.orderId || null,
          order_type: item.orderType || null,
          delivery_earning_minor: Number(item.deliveryEarningMinor || 0),
          tip_minor: Number(item.tipMinor || 0),
          incentive_minor: Number(item.incentiveMinor || 0),
          reimbursement_minor: Number(item.reimbursementMinor || 0),
          penalty_minor: Number(item.penaltyMinor || 0),
          withholding_minor: Number(item.withholdingMinor || 0),
          adjustment_minor: Number(item.adjustmentMinor || 0),
          net_due_minor:
            Number(item.deliveryEarningMinor || 0) +
            Number(item.tipMinor || 0) +
            Number(item.incentiveMinor || 0) +
            Number(item.reimbursementMinor || 0) -
            Number(item.penaltyMinor || 0) -
            Number(item.withholdingMinor || 0) +
            Number(item.adjustmentMinor || 0),
        })),
        { transaction }
      );
    }

    return payout;
  });
}

async function approveMzayaPayout({
  payoutId,
  approvedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const payout = await MzayaPayout.findByPk(payoutId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payout) {
      const error = new Error('Mzaya payout not found');
      error.status = 404;
      throw error;
    }

    if (payout.status === 'approved') return payout;
    if (payout.status !== 'draft') {
      const error = new Error('Only draft payouts can be approved');
      error.status = 409;
      throw error;
    }

    await payout.update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, { transaction });

    await emitMzayaPayoutDue({
      payout,
      transaction,
    });

    return payout;
  });
}

async function markMzayaPayoutPaid({
  payoutId,
  amountPaidMinor,
  provider = null,
  providerReference = null,
  paidBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const payout = await MzayaPayout.findByPk(payoutId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payout) {
      const error = new Error('Mzaya payout not found');
      error.status = 404;
      throw error;
    }

    if (!['approved', 'partially_paid'].includes(payout.status)) {
      const error = new Error('Mzaya payout is not ready for payment');
      error.status = 409;
      throw error;
    }

    const nextPaid =
      Number(payout.amount_paid_minor || 0) +
      Number(amountPaidMinor);

    if (
      Number(amountPaidMinor) <= 0 ||
      nextPaid > Number(payout.amount_due_minor)
    ) {
      const error = new Error('Mzaya payout payment exceeds amount due');
      error.status = 409;
      error.code = 'MZAYA_PAYOUT_OVERPAYMENT';
      throw error;
    }

    const paidInFull =
      nextPaid === Number(payout.amount_due_minor);

    await payout.update({
      amount_paid_minor: nextPaid,
      status: paidInFull ? 'paid' : 'partially_paid',
      provider,
      provider_reference: providerReference,
      paid_by: paidBy,
      paid_at: paidInFull ? new Date() : null,
    }, { transaction });

    if (paidInFull) {
      await emitMzayaPayoutPaid({
        payout,
        transaction,
      });
    }

    return payout;
  });
}

module.exports = {
  createMzayaPayout,
  approveMzayaPayout,
  markMzayaPayoutPaid,
};
