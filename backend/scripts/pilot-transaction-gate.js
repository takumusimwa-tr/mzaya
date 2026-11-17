'use strict';
// Batch 07.6G: offline preflight and guarded commands for isolated integration tests.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const targets = Object.freeze({
  claim: 'tests/checkout075m.claim.postgres.test.js',
  lifecycle: 'tests/checkout075q.lifecycle.postgres.test.js',
  deliveryFinance: 'tests/checkout075r.finance.postgres.test.js',
  providerConcurrency: 'tests/providerOutcomeConcurrency.e2e.test.js',
});
const required = [
  'src/services/order.service.js',
  'src/services/orderClaim.service.js',
  'src/services/providerOutcome.service.js',
  'scripts/migrate.js',
  ...Object.values(targets),
];
function inventory(exists = (relative) => fs.existsSync(path.join(root, relative))) {
  return required.map(relative => ({ relative, present: Boolean(exists(relative)) }));
}
function localDbGuard(env) {
  if (env.CHECKOUT_FINANCE_CONFIRM !== 'DISPOSABLE_LOCAL_DATABASE_ONLY') return 'Explicit disposable DB confirmation is required';
  if (!env.DB_URL) return 'DB_URL is required';
  let url;
  try { url = new URL(env.DB_URL); } catch { return 'DB_URL is invalid'; }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) return 'DB_URL must use PostgreSQL';
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return 'DB_URL must point to localhost';
  if (url.pathname !== '/mzaya') return 'DB_URL must target the disposable local mzaya database';
  return null;
}
function main(argv = process.argv.slice(2), env = process.env) {
  const missing = inventory().filter(item => !item.present);
  for (const item of inventory()) console.log(`${item.present ? 'PRESENT' : 'MISSING'} ${item.relative}`);
  if (missing.length) { console.error('FAIL: required integration sources/tests are missing'); return 1; }
  if (!argv.includes('--db')) {
    console.log('PASS: offline inventory. No database connection or test execution.');
    console.log('To run isolated tests: set CHECKOUT_FINANCE_CONFIRM and DB_URL, then use --db.');
    return 0;
  }
  const reason = localDbGuard(env);
  if (reason) { console.error(`REFUSED: ${reason}`); return 1; }
  console.log('Local DB preflight accepted. This command DOES NOT execute tests or migrations.');
  console.log('Run the existing isolated fixture scripts only after confirming the database is disposable and schema-ready.');
  console.log('Node fixture entrypoints:');
  for (const key of ['claim','lifecycle','deliveryFinance']) console.log(`  node ${targets[key]}`);
  console.log('Provider concurrency is a Jest test that uses database reset helpers; run separately ONLY on a disposable database:');
  console.log(`  npx jest --runInBand ${targets.providerConcurrency}`);
  return 0;
}
if (require.main === module) process.exitCode = main();
module.exports = { inventory, localDbGuard, main, targets };
