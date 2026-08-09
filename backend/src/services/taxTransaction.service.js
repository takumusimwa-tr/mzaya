const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  TaxTransaction,
} = require('../models/associations');
const {
  calculateTax,
} = require('./taxCalculation.service');
const {
  emitTaxLiabilityCreated,
  emitTaxReversed,
} = require('./taxFinanceEvents.service');

async function createTaxTransaction({
  sourceType,
  sourceId = null,
  sourceEventType = null,
  jurisdictionCode = null,
  taxCode,
  taxType,
  currency,
  taxableBaseMinor,
  taxRateBps,
  taxInclusive = false,
  direction = 'payable',
  metadata = {},
}) {
  return sequelize.transaction(async (transaction) => {
    const calculated = calculateTax({
      taxableBaseMinor,
      taxRateBps,
      taxInclusive,
    });

    const taxTransaction = await TaxTransaction.create({
      tax_reference:
        `TAX-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      source_type: sourceType,
      source_id: sourceId,
      source_event_type: sourceEventType,
      jurisdiction_code: jurisdictionCode,
      tax_code: taxCode,
      tax_type: taxType,
      currency: String(currency).toUpperCase(),
      taxable_base_minor: calculated.taxableBaseMinor,
      tax_rate_bps: calculated.taxRateBps,
      tax_amount_minor: calculated.taxAmountMinor,
      tax_inclusive: taxInclusive,
      direction,
      status: 'recognized',
      recognized_at: new Date(),
      metadata,
    }, { transaction });

    await emitTaxLiabilityCreated({
      taxTransaction,
      transaction,
    });

    return taxTransaction;
  });
}

async function reverseTaxTransaction({
  taxTransactionId,
  reason,
}) {
  return sequelize.transaction(async (transaction) => {
    const taxTransaction = await TaxTransaction.findByPk(
      taxTransactionId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!taxTransaction) {
      const error = new Error('Tax transaction not found');
      error.status = 404;
      throw error;
    }

    if (taxTransaction.status === 'reversed') {
      return taxTransaction;
    }

    await taxTransaction.update({
      status: 'reversed',
      reversed_at: new Date(),
      metadata: {
        ...(taxTransaction.metadata || {}),
        reversalReason: reason,
      },
    }, { transaction });

    await emitTaxReversed({
      taxTransaction,
      transaction,
    });

    return taxTransaction;
  });
}

module.exports = {
  createTaxTransaction,
  reverseTaxTransaction,
};
