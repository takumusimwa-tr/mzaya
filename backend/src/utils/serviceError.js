/**
 * Converts expected service-layer failures into stable HTTP responses while
 * allowing unexpected failures to reach the global error handler.
 */
function sendServiceError(error, res) {
  if (!error || !Number.isInteger(error.status)) return false;

  res.status(error.status).json({
    error: error.message,
    ...(error.code ? { code: error.code } : {}),
  });
  return true;
}

module.exports = { sendServiceError };
