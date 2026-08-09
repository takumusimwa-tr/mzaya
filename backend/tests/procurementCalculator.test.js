const {
  calculateProcurementTotals,
} = require('../src/services/procurementCalculator.service');

describe('procurement calculator', () => {
  test('calculates spend and refund correctly', () => {
    const result = calculateProcurementTotals({
      merchandiseCostMinor: 10000,
      procurementFeeMinor: 1000,
      deliveryFeeMinor: 1500,
      taxMinor: 500,
      discountMinor: 250,
      reimbursementMinor: 0,
      amountAuthorizedMinor: 14000,
    });

    expect(result.amountSpentMinor).toBe(12750);
    expect(result.amountRefundableMinor).toBe(1250);
  });
});
