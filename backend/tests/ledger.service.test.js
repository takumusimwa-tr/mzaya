const {
  validateBalancedEntries,
} = require('../src/services/ledger.service');

describe('ledger validation', () => {
  test('accepts balanced debit and credit entries', () => {
    expect(validateBalancedEntries([
      { direction: 'debit', amountMinor: 1000 },
      { direction: 'credit', amountMinor: 700 },
      { direction: 'credit', amountMinor: 300 },
    ])).toEqual({
      debits: 1000,
      credits: 1000,
    });
  });

  test('rejects unbalanced entries', () => {
    expect(() => validateBalancedEntries([
      { direction: 'debit', amountMinor: 1000 },
      { direction: 'credit', amountMinor: 900 },
    ])).toThrow('not balanced');
  });

  test('rejects invalid directions', () => {
    expect(() => validateBalancedEntries([
      { direction: 'debit', amountMinor: 1000 },
      { direction: 'increase', amountMinor: 1000 },
    ])).toThrow('debit or credit');
  });
});
