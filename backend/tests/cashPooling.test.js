const {
  calculateSweep,
} = require('../src/services/cashPooling.service');

describe('cash pooling sweeps', () => {
  test('sweeps surplus cash to the header account', () => {
    expect(calculateSweep({
      availableBalanceMinor: 50000,
      targetBalanceMinor: 20000,
      minimumSweepMinor: 5000,
      direction: 'both',
    })).toEqual({
      direction: 'to_header',
      amountMinor: 30000,
    });
  });

  test('does not sweep below the minimum threshold', () => {
    expect(calculateSweep({
      availableBalanceMinor: 22000,
      targetBalanceMinor: 20000,
      minimumSweepMinor: 5000,
      direction: 'both',
    })).toBeNull();
  });
});
