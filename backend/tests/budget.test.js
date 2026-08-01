const {
  validateBalancedBudget,
} = require('../src/services/budget.service');

describe('budget totals', () => {
  test('sums budget line values', () => {
    expect(validateBalancedBudget([
      { amountMinor: 1000 },
      { amountMinor: 2500 },
    ])).toBe(3500);
  });
});
