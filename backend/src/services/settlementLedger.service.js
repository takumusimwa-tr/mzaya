const {
  postLedgerTransaction,
} = require('./ledger.service');

/**
 * Moves value from the vendor or Mzaya payable account into payout clearing.
 * The external provider transfer is recorded separately.
 */
async function postSettlementLedger({
  settlement,
  actorId,
}) {
  return postLedgerTransaction({
    reference: `SET-${settlement.id}`,
    transactionType: 'settlement',
    currency: settlement.currency,
    description: `Settlement for ${settlement.owner_type} ${settlement.owner_id}`,
    createdBy: actorId,
    metadata: {
      settlementId: settlement.id,
      batchId: settlement.batch_id,
    },
    entries: [
      {
        accountId: settlement.payable_account_id,
        direction: 'debit',
        amountMinor: Number(settlement.net_minor),
      },
      {
        accountId: settlement.payout_account_id,
        direction: 'credit',
        amountMinor: Number(settlement.net_minor),
      },
    ],
  });
}

module.exports = {
  postSettlementLedger,
};
