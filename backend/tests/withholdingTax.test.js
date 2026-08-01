const {
  calculateTaxMinor,
} = require('../src/services/taxCalculation.service');

describe('withholding tax calculations', () => {
  test('calculates withholding in basis points', () => {
    expect(calculateTaxMinor({
      taxableMinor: 20000,
      rateBasisPoints: 500,
    })).toBe(1000);
  });
});
