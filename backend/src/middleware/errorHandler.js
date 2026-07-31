/**
 * ============================================================================
 * MZAYA
 * Middleware: Error Handling
 * Path: backend/src/middleware/errorHandler.js
 * ----------------------------------------------------------------------------
 * Provides canonical 404 and error responses while preserving request IDs.
 * ============================================================================
 */

const { logger } = require('../utils/logger');

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: 'Route not found',
    requestId: req.id,
  });
}

function errorHandler(err, req, res, _next) {
  logger.error('unhandled_error', {
    reqId: req.id,
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  if (res.headersSent) return;

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed',
      requestId: req.id,
    });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(status).json({
    error:
      status >= 500 && isProduction
        ? 'Internal server error'
        : err.message || 'Internal server error',
    requestId: req.id,
  });
}

module.exports = { notFoundHandler, errorHandler };
