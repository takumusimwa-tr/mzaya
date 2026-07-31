const {
  retryDelayMs,
} = require('../src/services/providerWebhookProcessor.service');

describe('provider webhook retry policy', () => {
  test('starts with a one-minute delay', () => {
    expect(retryDelayMs(1)).toBe(60 * 1000);
  });

  test('uses exponential retry delays', () => {
    expect(retryDelayMs(4)).toBe(8 * 60 * 1000);
  });

  test('caps retries at one hour', () => {
    expect(retryDelayMs(20)).toBe(60 * 60 * 1000);
  });
});
