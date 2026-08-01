const {
  applyForecastAssumptions,
} = require('../src/services/forecast.service');

describe('forecast assumptions', () => {
  test('applies growth and confidence', () => {
    expect(applyForecastAssumptions({
      baseMinor: 10000,
      growthRate: 0.1,
      confidenceRatio: 0.9,
    })).toBe(9900);
  });
});
