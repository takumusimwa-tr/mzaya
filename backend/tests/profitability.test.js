const {
  calculateContribution,
} = require('../src/services/profitability.service');

describe('finance profitability metrics', () => {
  test('calculates operational contribution', () => {
    expect(calculateContribution({
      platformRevenueMinor: 10000,
      refundsMinor: 1000,
      chargebacksMinor: 500,
      operationalCostsMinor: 1500,
    })).toEqual({
      contributionMinor: 7000,
      contributionMargin: 0.7,
    });
  });

  test('avoids division by zero', () => {
    expect(calculateContribution({
      platformRevenueMinor: 0,
      refundsMinor: 0,
      chargebacksMinor: 0,
    }).contributionMargin).toBe(0);
  });
});
