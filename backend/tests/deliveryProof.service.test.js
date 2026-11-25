const {
  validateProofPayload,
} = require('../src/services/deliveryProof.service');

describe('delivery proof validation', () => {
  test('rejects client-asserted OTP proof', () => {
    expect(() =>
      validateProofPayload({
        proofType: 'otp',
        otpVerified: true,
      })
    ).toThrow('OTP must be verified');
  });

  test('rejects unverified OTP proof', () => {
    expect(() =>
      validateProofPayload({
        proofType: 'otp',
        otpVerified: false,
      })
    ).toThrow('OTP must be verified');
  });

  test('requires a photo URL for photo proof', () => {
    expect(() =>
      validateProofPayload({
        proofType: 'photo',
        photoUrl: null,
      })
    ).toThrow('Delivery photo is required');
  });

  test('requires recipient name for confirmation proof', () => {
    expect(() =>
      validateProofPayload({
        proofType: 'recipient_confirmation',
        recipientName: '',
      })
    ).toThrow('Recipient name is required');
  });
  test('rejects malformed evidence and coordinates', () => {
    for (const payload of [
      { photoUrl: '   ' }, { photoUrl: {} }, { photoUrl: 'proof', latitude: 91, longitude: 0 },
      { photoUrl: 'proof', latitude: 0 }, { photoUrl: 'proof', notes: 'x'.repeat(501) },
    ]) expect(() => validateProofPayload({ proofType: 'photo', ...payload })).toThrow();
  });
  test('accepts zero coordinates', () => {
    expect(() => validateProofPayload({ proofType: 'photo', photoUrl: 'proof', latitude: 0, longitude: 0 })).not.toThrow();
  });
});
