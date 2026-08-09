const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  TaxLiability,
  TaxRemittance,
} = require('../models/associations');
const {
  createTreasuryTransfer,
} = require('./treasuryTransfer.service');

async function createTaxRemittance({
  liabilityId,
  amountMinor,
  sourceAccountId,
  provider = null,
  initiatedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const liability = await TaxLiability.findByPk(liabilityId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!liability) {
      const error = new Error('Tax liability not found');
      error.status = 404;
      throw error;
    }

    if (
      Number(amountMinor) <= 0 ||
      Number(amountMinor) > Number(liability.closing_balance_minor)
    ) {
      const error = new Error('Tax remittance exceeds outstanding liability');
      error.status = 409;
      error.code = 'TAX_REMITTANCE_EXCEEDS_LIABILITY';
      throw error;
    }

    const treasuryTransfer = await createTreasuryTransfer({
      transferType: 'tax_payment',
      sourceAccountId,
      destinationAccountId: null,
      currency: liability.currency,
      amountMinor,
      provider,
      initiatedBy,
      metadata: {
        taxLiabilityId: liability.id,
        taxCode: liability.tax_code,
        taxType: liability.tax_type,
        periodKey: liability.period_key,
      },
    });

    return TaxRemittance.create({
      remittance_reference:
        `TRM-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      liability_id: liability.id,
      treasury_transfer_id: treasuryTransfer.id,
      currency: liability.currency,
      amount_minor: amountMinor,
      status: 'draft',
      initiated_by: initiatedBy,
    }, { transaction });
  });
}

async function markTaxRemittancePaid({
  remittanceId,
  providerReference,
}) {
  return sequelize.transaction(async (transaction) => {
    const remittance = await TaxRemittance.findByPk(remittanceId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!remittance) {
      const error = new Error('Tax remittance not found');
      error.status = 404;
      throw error;
    }

    if (remittance.status === 'paid') return remittance;

    const liability = await TaxLiability.findByPk(
      remittance.liability_id,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    const nextPaid =
      Number(liability.tax_paid_minor || 0) +
      Number(remittance.amount_minor);

    const nextClosing =
      Math.max(
        0,
        Number(liability.opening_balance_minor || 0) +
        Number(liability.tax_accrued_minor || 0) +
        Number(liability.adjustments_minor || 0) -
        nextPaid
      );

    await remittance.update({
      status: 'paid',
      provider_reference: providerReference,
      paid_at: new Date(),
    }, { transaction });

    await liability.update({
      tax_paid_minor: nextPaid,
      closing_balance_minor: nextClosing,
      status: nextClosing === 0 ? 'paid' : 'open',
      closed_at: nextClosing === 0 ? new Date() : null,
    }, { transaction });

    return remittance;
  });
}

module.exports = {
  createTaxRemittance,
  markTaxRemittancePaid,
};
