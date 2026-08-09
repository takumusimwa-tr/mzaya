module.exports = {
  templateKey: 'mzaya_payout_paid',
  name: 'Mzaya payout paid',
  eventType: 'mzaya.payout_paid',
  lines: [
    {
      accountCode: 'MZAYA_PAYABLE',
      direction: 'debit',
      amountSource: 'event.payload.amountPaidMinor',
      memo: 'Mzaya payable settled',
    },
    {
      accountCode: 'CASH_AT_BANK',
      direction: 'credit',
      amountSource: 'event.payload.amountPaidMinor',
      memo: 'Mzaya payout cash outflow',
    },
  ],
};
