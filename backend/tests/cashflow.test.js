const {
  calculateCashflow,
} = require('../src/services/cashflow.service');

describe('finance cashflow metrics', () => {
  test('calculates inflow, outflow and net cashflow', () => {
    expect(calculateCashflow({
      inflowsMinor: 20000,
      refundsMinor: 1000,
      settlementsPaidMinor: 12000,
      chargebacksMinor: 500,
    })).toEqual({
      inflowsMinor: 20000,
      outflowsMinor: 13500,
      netCashflowMinor: 6500,
    });
  });
});
