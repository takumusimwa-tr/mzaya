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

// ─── Test database selection ─────────────────────────────────────────────────
//
// Priority:
//   1. Explicit TEST_DB_URL.
//   2. Legacy fallback: derive a database ending in "_test" from DB_URL.
//
// TEST_DB_URL is strongly preferred.
//
// Tests use sequelize.sync({ force: true }), which DROPS and recreates tables.
// TEST_DB_URL must therefore point only at a disposable test database.
//
// For the current local development environment this should be:
//
//   postgresql://USER:PASSWORD@localhost:5432/mzaya_test
//
// Never configure TEST_DB_URL to point at staging or production.

process.env.DB_URL = (() => {
  if (process.env.TEST_DB_URL) {
    return process.env.TEST_DB_URL;
  }

  const sourceUrl = process.env.DB_URL;

  if (sourceUrl) {
    return sourceUrl.replace(
      /\/([^/?]+)(\?.*)?$/,
      (_match, databaseName, queryString) =>
        `/${databaseName}_test${queryString || ''}`
    );
  }

  throw new Error(
    'No TEST_DB_URL or DB_URL found. Tests cannot determine a safe database.\n' +
    'Add an explicit TEST_DB_URL to backend/.env, for example:\n\n' +
    '  TEST_DB_URL=postgresql://USER:PASSWORD@localhost:5432/mzaya_test\n'
  );
})();

// ─── Validate destructive-test target ────────────────────────────────────────
//
// This is the first independent safety barrier.
//
// tests/setup.js performs another check immediately before sync({ force:true }).
// Both barriers intentionally validate the actual database name rather than
// merely searching the entire connection URL for the word "test".

let parsedTestDatabaseUrl;

try {
  parsedTestDatabaseUrl = new URL(process.env.DB_URL);
} catch {
  throw new Error(
    'TEST_DB_URL/DB_URL is not a valid PostgreSQL connection URL.'
  );
}

if (
  parsedTestDatabaseUrl.protocol !== 'postgresql:' &&
  parsedTestDatabaseUrl.protocol !== 'postgres:'
) {
  throw new Error(
    'TEST_DB_URL/DB_URL must use the PostgreSQL protocol.'
  );
}

const testDatabaseName =
  parsedTestDatabaseUrl.pathname.replace(/^\//, '');

if (!testDatabaseName) {
  throw new Error(
    'TEST_DB_URL/DB_URL does not contain a database name.'
  );
}

if (!/test/i.test(testDatabaseName)) {
  throw new Error(
    `Refusing to configure Jest with non-test database "${testDatabaseName}".`
  );
}

// ─── SSL selection ───────────────────────────────────────────────────────────
//
// Local PostgreSQL normally runs without TLS.
//
// Remote managed PostgreSQL services such as Render generally require TLS.
// config/db.js reads DB_SSL when it is first imported, so this decision must
// happen here before application modules load.

const hostname = parsedTestDatabaseUrl.hostname.toLowerCase();

const isLocalDatabase =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1';

process.env.DB_SSL = isLocalDatabase ? 'false' : 'true';

// ─── Test-only application defaults ──────────────────────────────────────────

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'test-secret-at-least-32-characters-long!!';

process.env.LOG_LEVEL = 'error';