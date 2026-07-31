const {
  validateRefundRequest,
} = require('../src/services/refundPolicy.service');

describe('refund policy', () => {
  test('accepts a partial refund within the remaining amount', () => {
    expect(validateRefundRequest({
      paymentStatus: 'paid',
      capturedAmountMinor: 5000,
      previouslyRefundedMinor: 1000,
      requestedAmountMinor: 1500,
    })).toEqual({
      remainingBeforeMinor: 4000,
      remainingAfterMinor: 2500,
      fullRefund: false,
    });
  });

  test('detects a full remaining refund', () => {
    expect(validateRefundRequest({
      paymentStatus: 'captured',
      capturedAmountMinor: 5000,
      previouslyRefundedMinor: 1000,
      requestedAmountMinor: 4000,
    }).fullRefund).toBe(true);
  });

  test('rejects refunds above the available amount', () => {
    expect(() => validateRefundRequest({
      paymentStatus: 'paid',
      capturedAmountMinor: 5000,
      previouslyRefundedMinor: 1000,
      requestedAmountMinor: 4500,
    })).toThrow('remaining refundable amount');
  });
});
