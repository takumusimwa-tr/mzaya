const {
  stablePayloadHash,
} = require('../src/services/financeIdempotency.service');

describe('finance event idempotency', () => {
  test('identical payloads hash consistently', () => {
    const payload = { orderId: 'abc', amountMinor: 2500 };
    expect(stablePayloadHash(payload)).toBe(stablePayloadHash(payload));
  });

  test('different payloads produce different hashes', () => {
    expect(stablePayloadHash({ amountMinor: 100 }))
      .not.toBe(stablePayloadHash({ amountMinor: 101 }));
  });
});
