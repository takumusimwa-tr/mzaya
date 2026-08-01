const {
  calculateRunwayDays,
} = require('../src/services/liquidity.service');

describe('liquidity runway', () => {
  test('calculates runway days', () => {
    expect(calculateRunwayDays({
      availableCashMinor: 300000,
      averageDailyOutflowMinor: 10000,
    })).toBe(30);
  });

  test('returns null when outflows are zero', () => {
    expect(calculateRunwayDays({
      availableCashMinor: 300000,
      averageDailyOutflowMinor: 0,
    })).toBeNull();
  });
});
