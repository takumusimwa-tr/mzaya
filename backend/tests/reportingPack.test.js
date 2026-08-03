const {
  generateExecutiveNarrative,
} = require('../src/services/financeNarrative.service');

describe('executive finance narrative', () => {
  test('includes order and margin context', () => {
    const text = generateExecutiveNarrative({
      period: { currency: 'USD' },
      totals: {
        orderCount: 10,
        revenueMinor: 100000,
        contributionMarginRatio: 0.3,
        netMarginRatio: 0.2,
      },
      liquidity: { available_cash_minor: 500000 },
      treasuryAlerts: [],
    });

    expect(text).toContain('10 completed orders');
    expect(text).toContain('30.0%');
  });
});
