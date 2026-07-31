const {
  hmacSha256,
  timingSafeEqualHex,
} = require('../src/services/providerSignature.service');

describe('provider webhook signatures', () => {
  test('creates deterministic HMAC signatures', () => {
    expect(
      hmacSha256('secret', Buffer.from('payload'))
    ).toBe(
      hmacSha256('secret', Buffer.from('payload'))
    );
  });

  test('compares equal hexadecimal signatures safely', () => {
    const signature = hmacSha256('secret', Buffer.from('payload'));
    expect(timingSafeEqualHex(signature, signature)).toBe(true);
  });

  test('rejects signatures with different lengths', () => {
    expect(timingSafeEqualHex('aa', 'aaaa')).toBe(false);
  });
});
