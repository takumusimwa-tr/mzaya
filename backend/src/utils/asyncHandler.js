/**
 * Wraps async Express handlers and forwards rejected promises to the app-level
 * error middleware. Controllers remain focused on HTTP translation.
 */
function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
