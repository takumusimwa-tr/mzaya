'use strict';
// Offline only: inspect configuration shape without connecting or exposing credentials.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fixtures = [
  'tests/checkout075m.claim.postgres.test.js',
  'tests/checkout075q.lifecycle.postgres.test.js',
  'tests/checkout075r.finance.postgres.test.js',
  'tests/providerOutcomeConcurrency.e2e.test.js',
  'tests/setup.js',
];
function inspect(env = process.env, exists = p => fs.existsSync(path.join(root, p))) {
  const findings = fixtures.map(file => ({ check: file, ok: Boolean(exists(file)) }));
  const url = env.DB_URL || '';
  let parsed = null;
  try { if (url) parsed = new URL(url); } catch { /* invalid URL */ }
  const local = Boolean(parsed && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname));
  const postgres = Boolean(parsed && ['postgres:', 'postgresql:'].includes(parsed.protocol));
  const db = parsed ? parsed.pathname.slice(1) : '';
  const valid = Boolean(local && postgres && db);
  findings.push({ check: 'DB_URL is configured as a local PostgreSQL URL', ok: valid });
  findings.push({ check: 'NODE_ENV=test (needed by reset-based suites)', ok: env.NODE_ENV === 'test' });
  findings.push({ check: 'DB name contains test (needed by reset-based suites)', ok: /test/i.test(db) });
  return { findings, databaseKind: !parsed ? 'not-configured-or-invalid' : !valid ? 'not-safe-local-postgres' : /test/i.test(db) ? 'local-test-named' : 'local-non-test-named' };
}
function main() {
  const result = inspect();
  for (const item of result.findings) console.log(`${item.ok ? 'PASS' : 'REVIEW'} ${item.check}`);
  console.log(`Database target classification: ${result.databaseKind}`);
  console.log('OFFLINE ONLY: no connections, migrations, schema resets, or fixture execution.');
  console.log('Do not paste DB_URL, passwords, or .env contents into chat.');
  return result.findings.slice(0, fixtures.length).every(x => x.ok) ? 0 : 1;
}
if (require.main === module) process.exitCode = main();
module.exports = { inspect, main, fixtures };
