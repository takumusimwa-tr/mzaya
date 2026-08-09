module.exports = {
  templateKey: 'tax_liability_created',
  name: 'Tax liability created',
  eventType: 'tax.liability_created',
  lines: [
    {
      accountCode: 'TAX_EXPENSE_OR_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.taxAmountMinor',
      memo: 'Tax amount recognized',
    },
    {
      accountCode: 'TAX_PAYABLE',
      direction: 'credit',
      amountSource: 'event.payload.taxAmountMinor',
      memo: 'Tax liability recognized',
    },
  ],
};
