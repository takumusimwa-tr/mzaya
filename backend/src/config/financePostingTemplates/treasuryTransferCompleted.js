module.exports = {
  templateKey: 'treasury_transfer_completed',
  name: 'Treasury transfer completed',
  eventType: 'treasury.transfer_completed',
  lines: [
    {
      accountCode: 'TREASURY_SOURCE_ACCOUNT',
      direction: 'credit',
      amountSource: 'event.amount_minor',
      memo: 'Treasury source account decreased',
    },
    {
      accountCode: 'TREASURY_DESTINATION_OR_CLEARING',
      direction: 'debit',
      amountSource: 'event.amount_minor',
      memo: 'Treasury destination or payable cleared',
    },
  ],
};
