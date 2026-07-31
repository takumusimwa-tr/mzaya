/**
 * ============================================================================
 * MZAYA
 * Middleware: Audit Logger
 * Path: backend/src/middleware/auditLogger.js
 * ----------------------------------------------------------------------------
 * Emits one structured audit event after a sensitive mutation completes.
 * Payload bodies are never logged. Only identifiers and outcome metadata are.
 * ============================================================================
 */

const { logger } = require('../utils/logger');

function auditLogger(action, resource, options = {}) {
  const {
    resourceId = (req) =>
      req.branch?.id ||
      req.params?.itemId ||
      req.params?.id ||
      null,
    metadata = () => ({}),
  } = options;

  return (req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      logger.info('audit_event', {
        action,
        resource,
        resourceId: resourceId(req),
        actorId: req.user?.id || null,
        actorRole: req.user?.role || null,
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        succeeded: res.statusCode >= 200 && res.statusCode < 400,
        durationMs: Date.now() - startedAt,
        ...metadata(req, res),
      });
    });

    return next();
  };
}

module.exports = { auditLogger };
