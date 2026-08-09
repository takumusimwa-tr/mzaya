const {
  calculateMzayaPayout,
} = require('../src/services/mzayaPayoutCalculator.service');

describe('Mzaya payout calculator', () => {
  test('calculates payout amount due', () => {
    const result = calculateMzayaPayout({
      deliveryEarningsMinor: 10000,
      tipsMinor: 1000,
      incentivesMinor: 500,
      reimbursementsMinor: 250,
      penaltiesMinor: 400,
      withholdingMinor: 350,
      adjustmentsMinor: 100,
    });

    expect(result.amountDueMinor).toBe(11100);
  });
});
