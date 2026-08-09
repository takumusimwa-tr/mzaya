module.exports = {
  templateKey: 'treasury_transfer_approved_trace',
  name: 'Treasury transfer approved — non-posting trace',
  eventType: 'treasury.transfer_approved',
  lines: [
    {
      accountCode: 'TREASURY_AUTHORIZATION_CLEARING',
      direction: 'debit',
      amountSource: 'event.amount_minor',
      memo: 'Treasury approval trace',
    },
    {
      accountCode: 'TREASURY_AUTHORIZATION_CLEARING',
      direction: 'credit',
      amountSource: 'event.amount_minor',
      memo: 'Treasury approval trace',
    },
  ],
};
