const {
  computeBackoffMs,
  MAX_ATTEMPTS,
} = require('../src/services/financeEventDelivery.service');

describe('finance event delivery', () => {
  test('retry backoff grows and stays bounded', () => {
    expect(computeBackoffMs(2)).toBeGreaterThan(computeBackoffMs(1));
    expect(computeBackoffMs(20)).toBeLessThanOrEqual(360 * 60 * 1000);
  });

  test('retry attempts are bounded', () => {
    expect(MAX_ATTEMPTS).toBe(8);
  });
});
