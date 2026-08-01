const {
  calculateTreasuryForecast,
} = require('../src/services/treasuryForecast.service');

describe('treasury forecast', () => {
  test('calculates closing cash and reserve gap', () => {
    expect(calculateTreasuryForecast({
      openingCashMinor: 100000,
      expectedInflowsMinor: 50000,
      expectedOutflowsMinor: 120000,
      minimumReserveMinor: 40000,
    })).toEqual({
      openingCashMinor: 100000,
      expectedInflowsMinor: 50000,
      expectedOutflowsMinor: 120000,
      closingCashMinor: 30000,
      reserveGapMinor: 10000,
      belowReserve: true,
    });
  });
});
