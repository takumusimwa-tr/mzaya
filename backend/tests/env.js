// backend/tests/env.js
//
// Runs via Jest's `setupFiles`, which executes BEFORE the test module — and
// crucially before the test file's own `require('../src/app')` — is evaluated.
//
// This ordering is the whole point. The test files require app.js on line 2, which
// transitively loads payment.service.js (which bakes MOCK from the environment,
// once) and config/db (which reads DB_URL, once). If the environment isn't already
// correct at that instant, both are wrong for the rest of the run:
//   • MOCK bakes false (real Paynow creds still present) → payment tests 502
//   • DB_URL may point at the dev database
//
// Putting the env bootstrap in setup.js was too late: the test files import app
// BEFORE they import setup. setupFiles closes that gap.

process.env.NODE_ENV = 'test';

// Force simulated payments, unconditionally, before anything reads the flag.
process.env.ALLOW_MOCK_PAYMENTS = 'true';

// Load .env, then NEUTRALISE the Paynow credentials.
//
// NOT delete — set to empty string. This is the subtle part that bit us: app.js
// also runs dotenv.config({ override: false }). `override: false` only skips vars
// that are already SET. If we DELETE the Paynow vars, they're unset, so app.js's
// dotenv cheerfully re-injects them from .env — and MOCK goes false again.
//
// Setting them to '' keeps them "set" (so override:false leaves them alone) while
// staying falsy, so HAS_CREDS = !!(id && key) is false and MOCK stays true. A test
// run can never reach the real payment provider.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
process.env.PAYNOW_INTEGRATION_ID = '';
process.env.PAYNOW_INTEGRATION_KEY = '';

// Point at the TEST database.
//
//  1. TEST_DB_URL if you set one (the explicit, recommended path).
//  2. Otherwise derive from DB_URL by appending _test — same host, same
//     credentials, different database.
//
// If NEITHER exists we fail loudly rather than falling back to a guessed URL with
// the wrong password (which just makes every query fail with a confusing error).
process.env.DB_URL = (() => {
  if (process.env.TEST_DB_URL) return process.env.TEST_DB_URL;

  const dev = process.env.DB_URL;
  if (dev) return dev.replace(/\/([^/?]+)(\?.*)?$/, (_m, db, qs) => `/${db}_test${qs || ''}`);

  throw new Error(
    'No TEST_DB_URL or DB_URL found. Your .env uses neither, so tests can\'t find a\n' +
    'database. Add this line to backend/.env:\n\n' +
    '  TEST_DB_URL=postgresql://postgres:1808@localhost:5432/mzaya_test\n'
  );
})();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-32-characters-long!!';
process.env.LOG_LEVEL = 'error';
