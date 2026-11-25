// backend/tests/env.js
//
// Jest environment bootstrap.
//
// This file runs through Jest's `setupFiles`, which executes BEFORE each test
// module is evaluated. That ordering is critical because test files may require
// app.js before requiring tests/setup.js.
//
// app.js transitively loads services and config/db.js, both of which read
// environment variables at module-load time. Therefore NODE_ENV, payment
// isolation, DB_URL, and DB_SSL must all be correct before application code
// is imported.

process.env.NODE_ENV = 'test';

// Force simulated payments before any payment module is loaded.
// Tests must never initiate real provider activity.
process.env.ALLOW_MOCK_PAYMENTS = 'true';

const path = require('path');
const explicitTestUrl = process.env.TEST_DB_URL;

// Load the backend environment.
//
// override:false is intentional. Values already established by the test
// bootstrap or shell must not be replaced by .env.
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  override: false,
});

// ─── Payment-provider isolation ───────────────────────────────────────────────
//
// Do NOT delete these variables.
//
// app.js may call dotenv.config() again with override:false. Keeping the
// variables defined as empty strings prevents real Paynow credentials from
// being re-injected while ensuring they remain falsy to payment code.
process.env.PAYNOW_INTEGRATION_ID = '';
process.env.PAYNOW_INTEGRATION_KEY = '';

// Require explicit shell configuration; never derive a database from DB_URL.
const { assertIntegrationUrl } = require('./integrationDatabaseGuard');
assertIntegrationUrl(explicitTestUrl);
process.env.TEST_DB_URL = explicitTestUrl;
process.env.DB_URL = explicitTestUrl;
process.env.DB_SSL = 'false';

// ─── Test-only application defaults ──────────────────────────────────────────

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'test-secret-at-least-32-characters-long!!';

process.env.LOG_LEVEL = 'error';