// backend/scripts/release-gate.js
// Batch 08.6.7: non-mutating release preflight.
// Purpose: catch unsafe release context before a human runs the documented gates.
// Integration: reads environment/package metadata only; it never connects to providers
// or executes database DDL/DML. Migration/test commands remain explicit human actions.

const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(backendRoot, 'package.json'), 'utf8')
);

const failures = [];
const warnings = [];
const ok = [];

function pass(message) {
  ok.push(message);
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function parseMajor(version) {
  const match = String(version || '').match(/^v?(\d+)/);
  return match ? Number(match[1]) : null;
}

const nodeMajor = parseMajor(process.version);
if (nodeMajor === 24) {
  pass(`Node runtime is on validated major 24 (${process.version}).`);
} else {
  warn(
    `Node runtime is ${process.version}; the validated deployment line for the ` +
      '08.6.6 baseline is Node 24.x.'
  );
}

if (packageJson.dependencies?.['sequelize-cli']) {
  fail('sequelize-cli is declared; Mzaya uses scripts/migrate.js as the canonical runner.');
} else {
  pass('sequelize-cli is not declared.');
}

const migrationRunner = path.join(backendRoot, 'scripts', 'migrate.js');
if (fs.existsSync(migrationRunner)) {
  pass('Canonical custom SQL migration runner exists.');
} else {
  fail('Missing scripts/migrate.js.');
}

const requiredSafetyFiles = [
  'tests/env.js',
  'tests/setup.js',
  'scripts/probe-migration.js',
  'scripts/reconcile-migrations.js',
  'scripts/audit-migration-schema.js',
];

for (const relativePath of requiredSafetyFiles) {
  if (fs.existsSync(path.join(backendRoot, relativePath))) {
    pass(`${relativePath} present.`);
  } else {
    fail(`${relativePath} missing.`);
  }
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  if (process.env.TEST_DB_URL) {
    warn('TEST_DB_URL is present in a deployed environment; verify it is intentionally configured.');
  }
}

if (process.env.PAYNOW_INTEGRATION_KEY && process.env.NODE_ENV === 'test') {
  fail('PAYNOW_INTEGRATION_KEY is populated while NODE_ENV=test.');
}

console.log('\nMzaya release preflight\n');

ok.forEach((message) => console.log(`PASS  ${message}`));
warnings.forEach((message) => console.log(`WARN  ${message}`));
failures.forEach((message) => console.log(`FAIL  ${message}`));

console.log(
  `\n${ok.length} pass, ${warnings.length} warning, ${failures.length} failure.\n`
);

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log(
    'Preflight is structurally green. Continue with FINANCE_RELEASE_RUNBOOK.md; ' +
      'this script does not replace tests, dependency audit, migration status, or human review.'
  );
}
