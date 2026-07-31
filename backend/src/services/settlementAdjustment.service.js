const {
  SettlementAdjustment,
} = require('../models/associations');

async function createSettlementAdjustment({
  ownerType,
  ownerId,
  currency,
  amountMinor,
  adjustmentType,
  reason,
  createdBy,
  metadata = {},
}) {
  if (!Number.isSafeInteger(Number(amountMinor)) || Number(amountMinor) === 0) {
    const error = new Error('Adjustment amount must be a non-zero integer');
    error.status = 422;
    error.code = 'INVALID_ADJUSTMENT_AMOUNT';
    throw error;
  }

  return SettlementAdjustment.create({
    owner_type: ownerType,
    owner_id: ownerId,
    currency: String(currency).toUpperCase(),
    amount_minor: amountMinor,
    adjustment_type: adjustmentType,
    reason,
    created_by: createdBy,
    metadata,
  });
}

module.exports = {
  createSettlementAdjustment,
};
