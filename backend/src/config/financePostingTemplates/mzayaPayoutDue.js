module.exports = {
  templateKey: 'mzaya_payout_due',
  name: 'Mzaya payout due',
  eventType: 'mzaya.payout_due',
  lines: [
    {
      accountCode: 'DELIVERY_COST_OR_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.amountDueMinor',
      memo: 'Mzaya payout obligation recognized',
    },
    {
      accountCode: 'MZAYA_PAYABLE',
      direction: 'credit',
      amountSource: 'event.payload.amountDueMinor',
      memo: 'Mzaya payable recognized',
    },
  ],
};
