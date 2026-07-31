/**
 * Requires mutation callers to provide an idempotency key.
 * The controller/service still decides the operation name and stored response.
 */
function requirePaymentIdempotencyKey(req, res, next) {
  const key = req.get('Idempotency-Key');

  if (!key || key.length < 12 || key.length > 180) {
    return res.status(400).json({
      error: 'A valid Idempotency-Key header is required',
      code: 'IDEMPOTENCY_KEY_REQUIRED',
    });
  }

  req.paymentIdempotencyKey = key;
  return next();
}

module.exports = {
  requirePaymentIdempotencyKey,
};
