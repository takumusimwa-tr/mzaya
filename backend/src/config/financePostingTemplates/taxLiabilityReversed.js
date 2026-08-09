module.exports = {
  templateKey: 'tax_liability_reversed',
  name: 'Tax liability reversed',
  eventType: 'tax.liability_reversed',
  lines: [
    {
      accountCode: 'TAX_PAYABLE',
      direction: 'debit',
      amountSource: 'event.payload.taxAmountMinor',
      memo: 'Tax liability reversed',
    },
    {
      accountCode: 'TAX_EXPENSE_OR_CLEARING',
      direction: 'credit',
      amountSource: 'event.payload.taxAmountMinor',
      memo: 'Tax recognition reversed',
    },
  ],
};
