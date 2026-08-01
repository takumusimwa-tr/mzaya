const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  TreasuryPaymentBatch,
  TreasuryPaymentBatchItem,
} = require('../models/associations');

function validateBatchItems(items) {
  if (!Array.isArray(items) || !items.length) {
    const error = new Error('Payment batch requires at least one item');
    error.status = 422;
    throw error;
  }

  const currency = items[0].currency;
  for (const item of items) {
    if (item.currency !== currency) {
      const error = new Error('Payment batch items must use one currency');
      error.status = 422;
      throw error;
    }
    if (!Number.isSafeInteger(Number(item.amountMinor)) || Number(item.amountMinor) <= 0) {
      const error = new Error('Payment item amount must be positive');
      error.status = 422;
      throw error;
    }
  }

  return {
    currency,
    totalMinor: items.reduce(
      (sum, item) => sum + Number(item.amountMinor),
      0
    ),
  };
}

async function createPaymentBatch({
  items,
  createdBy,
}) {
  const summary = validateBatchItems(items);

  return sequelize.transaction(async (transaction) => {
    const batch = await TreasuryPaymentBatch.create({
      batch_reference: `TB-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      currency: summary.currency,
      payment_count: items.length,
      total_minor: summary.totalMinor,
      created_by: createdBy,
      status: 'draft',
    }, { transaction });

    await TreasuryPaymentBatchItem.bulkCreate(
      items.map((item) => ({
        batch_id: batch.id,
        beneficiary_type: item.beneficiaryType,
        beneficiary_id: item.beneficiaryId || null,
        beneficiary_name: item.beneficiaryName,
        destination_token: item.destinationToken || null,
        amount_minor: item.amountMinor,
        currency: item.currency,
        purpose: item.purpose || null,
        source_type: item.sourceType || null,
        source_id: item.sourceId || null,
      })),
      { transaction }
    );

    return batch;
  });
}

module.exports = {
  validateBatchItems,
  createPaymentBatch,
};
