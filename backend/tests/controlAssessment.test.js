const {
  calculateEffectiveness,
  rateOperatingEffectiveness,
} = require('../src/services/financeControlAssessment.service');

describe('finance control assessment', () => {
  test('calculates effectiveness score', () => {
    expect(calculateEffectiveness({
      sampleSize: 100,
      exceptionsCount: 2,
    })).toBe(0.98);
  });

  test('rates strong effectiveness', () => {
    expect(rateOperatingEffectiveness(0.99)).toBe('effective');
  });
});
