const {
  tokenSimilarity,
  dateScore,
  scoreReconciliationCandidate,
} = require('../src/services/reconciliationScoring.service');

describe('treasury reconciliation scoring', () => {
  test('scores identical token sets as one', () => {
    expect(tokenSimilarity('PAY ORDER 100', 'PAY ORDER 100')).toBe(1);
  });

  test('scores same-day transactions as one', () => {
    expect(dateScore('2026-08-01', '2026-08-01')).toBe(1);
  });

  test('strongly scores exact amount and reference matches', () => {
    const result = scoreReconciliationCandidate({
      bankTransaction: {
        amount_minor: 5000,
        transaction_date: '2026-08-01',
        provider_reference: 'PAY-ABC',
        counterparty_reference: '',
        description: 'Order payment',
      },
      ledgerTransaction: {
        reference: 'PAY-ABC',
        occurred_at: '2026-08-01T10:00:00.000Z',
        description: 'Order payment',
      },
      ledgerAmountMinor: 5000,
    });

    expect(result.score).toBeGreaterThan(0.9);
  });
});
