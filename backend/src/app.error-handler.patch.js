/**
 * ============================================================================
 * MZAYA
 * Integration Patch: app.js Error Middleware
 * Path: backend/src/app.error-handler.patch.js
 * ----------------------------------------------------------------------------
 * This file is a copy-ready patch guide, not a runtime module.
 *
 * 1. Add near the imports in src/app.js:
 *
 * const {
 *   notFoundHandler,
 *   errorHandler,
 * } = require('./middleware/errorHandler');
 *
 * 2. Delete the existing inline `app.use((err, req, res, _next) => { ... })`.
 *
 * 3. Add these two lines after all routes and the root endpoint:
 *
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 *
 * The 404 handler must be after valid routes. The error handler must be last.
 * ============================================================================
 */
