const {
  calculateTax,
} = require('../src/services/taxCalculation.service');

describe('tax calculation utility', () => {
  test('calculates exclusive tax from basis points', () => {
    const result = calculateTax({
      taxableBaseMinor: 10000,
      taxRateBps: 1500,
      taxInclusive: false,
    });

    expect(result.taxAmountMinor).toBe(1500);
  });

  test('calculates inclusive tax portion', () => {
    const result = calculateTax({
      taxableBaseMinor: 11500,
      taxRateBps: 1500,
      taxInclusive: true,
    });

    expect(result.taxAmountMinor).toBe(1500);
  });
});
