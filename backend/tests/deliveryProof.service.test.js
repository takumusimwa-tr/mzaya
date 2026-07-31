const {
  validateProofPayload,
} = require('../src/services/deliveryProof.service');

describe('delivery proof validation', () => {
  test('accepts verified OTP proof', () => {
    expect(() =>
      validateProofPayload({
        proofType: 'otp',
        otpVerified: true,
      })
    ).not.toThrow();
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
});
