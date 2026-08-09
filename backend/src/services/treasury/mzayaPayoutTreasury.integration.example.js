const {
  createTreasuryTransfer,
} = require('../treasuryTransfer.service');

async function createMzayaPayoutTransfer({
  payout,
  sourceAccountId,
  initiatedBy,
}) {
  return createTreasuryTransfer({
    transferType: 'mzaya_payout',
    sourceAccountId,
    destinationAccountId: null,
    currency: payout.currency,
    amountMinor: Number(payout.amount_due_minor),
    provider: payout.provider || null,
    initiatedBy,
    metadata: {
      mzayaPayoutId: payout.id,
      mzayaId: payout.mzaya_id,
    },
  });
}

module.exports = { createMzayaPayoutTransfer };
