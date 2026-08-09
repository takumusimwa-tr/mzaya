const {
  conditionMatches,
} = require('../src/services/financePostingRule.service');

describe('finance posting rules', () => {
  test('matches nested payload conditions', () => {
    expect(conditionMatches(
      { 'payment.method': 'paynow', channel: ['web', 'app'] },
      { payment: { method: 'paynow' }, channel: 'app' }
    )).toBe(true);
  });
});
