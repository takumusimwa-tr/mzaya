/**
 * ============================================================================
 * MZAYA
 * Utility: API Responses
 * Path: backend/src/utils/apiResponse.js
 * ----------------------------------------------------------------------------
 * Small response helpers for controllers. Existing response contracts remain
 * valid; adoption can happen incrementally.
 * ============================================================================
 */

function success(res, data = {}, status = 200) {
  return res.status(status).json(data);
}

function created(res, data = {}) {
  return success(res, data, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function failure(res, status, error, extra = {}) {
  return res.status(status).json({ error, ...extra });
}

module.exports = { success, created, noContent, failure };
