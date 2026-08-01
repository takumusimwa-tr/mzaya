const {
  convertMinorUnits,
} = require('../src/services/fxRate.service');

describe('treasury FX conversion', () => {
  test('converts minor units using a decimal rate', () => {
    expect(convertMinorUnits({
      amountMinor: 10000,
      rate: 1.25,
    })).toBe(12500);
  });
});
