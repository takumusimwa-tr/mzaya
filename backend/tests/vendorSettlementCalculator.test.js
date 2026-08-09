const {
  calculateVendorSettlement,
} = require('../src/services/vendorSettlementCalculator.service');

describe('vendor settlement calculator', () => {
  test('calculates vendor amount due', () => {
    const result = calculateVendorSettlement({
      grossSalesMinor: 10000,
      refundsMinor: 500,
      discountsMinor: 250,
      commissionMinor: 1000,
      platformFeeMinor: 500,
      taxWithheldMinor: 250,
      adjustmentsMinor: 100,
    });

    expect(result.amountDueMinor).toBe(7600);
  });
});
