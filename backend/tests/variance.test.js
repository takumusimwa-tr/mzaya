const {
  calculateVariance,
} = require('../src/services/variance.service');

describe('variance calculations', () => {
  test('revenue upside is favorable', () => {
    expect(calculateVariance({
      actualMinor: 12000,
      comparatorMinor: 10000,
      lineType: 'revenue',
    })).toEqual({
      varianceMinor: 2000,
      varianceRatio: 0.2,
      favorable: true,
    });
  });

  test('expense overspend is unfavorable', () => {
    expect(calculateVariance({
      actualMinor: 12000,
      comparatorMinor: 10000,
      lineType: 'expense',
    }).favorable).toBe(false);
  });
});
