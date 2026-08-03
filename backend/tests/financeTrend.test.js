const {
  calculateTrend,
} = require('../src/services/financeTrend.service');

describe('finance trend calculation', () => {
  test('calculates positive trend', () => {
    expect(calculateTrend([100, 120])).toEqual({
      direction: 'up',
      absoluteChange: 20,
      percentageChange: 0.2,
    });
  });
});
