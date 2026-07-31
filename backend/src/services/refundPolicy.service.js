function policyError(message, code) {
  const error = new Error(message);
  error.status = 422;
  error.code = code;
  return error;
}

function validateRefundRequest({
  paymentStatus,
  capturedAmountMinor,
  previouslyRefundedMinor = 0,
  requestedAmountMinor,
}) {
  if (!['paid', 'captured', 'completed'].includes(paymentStatus)) {
    throw policyError('Payment is not refundable', 'PAYMENT_NOT_REFUNDABLE');
  }

  const amount = Number(requestedAmountMinor);
  const remaining =
    Number(capturedAmountMinor) - Number(previouslyRefundedMinor);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw policyError('Refund amount must be positive', 'INVALID_REFUND_AMOUNT');
  }

  if (amount > remaining) {
    throw policyError(
      'Refund exceeds the remaining refundable amount',
      'REFUND_EXCEEDS_AVAILABLE'
    );
  }

  return {
    remainingBeforeMinor: remaining,
    remainingAfterMinor: remaining - amount,
    fullRefund: amount === remaining,
  };
}

module.exports = { validateRefundRequest };
