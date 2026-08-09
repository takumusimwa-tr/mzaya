/**
 * Batch 08.5.6 bridge example:
 * after a vendor settlement is approved, treasury may create an external payout
 * instruction. Provider execution remains outside finance replay.
 */
const {
  createTreasuryTransfer,
} = require('../treasuryTransfer.service');

async function createVendorSettlementTransfer({
  settlement,
  sourceAccountId,
  initiatedBy,
}) {
  return createTreasuryTransfer({
    transferType: 'vendor_payout',
    sourceAccountId,
    destinationAccountId: null,
    currency: settlement.currency,
    amountMinor: Number(settlement.amount_due_minor),
    provider: settlement.provider || null,
    initiatedBy,
    metadata: {
      vendorSettlementId: settlement.id,
      vendorId: settlement.vendor_id,
    },
  });
}

module.exports = { createVendorSettlementTransfer };
