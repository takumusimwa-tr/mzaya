const {
  buildJournalFromTemplate,
} = require('../src/services/financePostingEngine.service');

describe('finance posting balance', () => {
  test('builds balanced double-entry journal', () => {
    const journal = buildJournalFromTemplate({
      template: {
        lines: [
          {
            accountCode: 'CASH',
            direction: 'debit',
            amountSource: 'event.amount_minor',
          },
          {
            accountCode: 'CUSTOMER_FUNDS',
            direction: 'credit',
            amountSource: 'event.amount_minor',
          },
        ],
      },
      event: {
        event_type: 'payment.captured',
        amount_minor: 5000,
        currency: 'USD',
      },
    });

    expect(journal.balanced).toBe(true);
    expect(journal.debitTotalMinor).toBe(5000);
    expect(journal.creditTotalMinor).toBe(5000);
  });
});
