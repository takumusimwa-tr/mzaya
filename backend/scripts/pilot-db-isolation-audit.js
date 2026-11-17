'use strict';
// 07.6H: offline-only review of fixture isolation requirements.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = Object.freeze({
  gate: 'scripts/pilot-transaction-gate.js',
  resetHelper: 'tests/setup.js',
  provider: 'tests/providerOutcomeConcurrency.e2e.test.js',
  finance: 'tests/checkout075r.finance.postgres.test.js',
});
function inspect(read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')) {
  const sources = Object.fromEntries(Object.entries(files).map(([key, relative]) => [key, read(relative)]));
  return [
    { name: '07.6G preflight targets mzaya', passed: /url\.pathname\s*!==\s*['"]\/mzaya['"]/.test(sources.gate) },
    { name: 'Database reset requires test-named database', passed: /database name must contain|\/test\/i\.test\(databaseName\)/i.test(sources.resetHelper) },
    { name: 'Provider suite calls resetDatabase', passed: /await\s+resetDatabase\s*\(/.test(sources.provider) },
    { name: 'Finance fixture requires explicit disposable confirmation', passed: /CHECKOUT_FINANCE_CONFIRM/.test(sources.finance) && /DISPOSABLE_LOCAL_DATABASE_ONLY/.test(sources.finance) },
    { name: 'Finance fixture restricts DB name to mzaya', passed: /url\.pathname\s*,\s*['"]\/mzaya['"]/.test(sources.finance) },
  ];
}
function main() {
  let results;
  try { results = inspect(); } catch (error) {
    console.error(`FAIL: cannot inspect fixture source: ${error.message}`);
    return 1;
  }
  for (const item of results) console.log(`${item.passed ? 'PASS' : 'REVIEW'} ${item.name}`);
  if (results.some(item => !item.passed)) return 1;
  console.log('BLOCKED: do not run provider reset suite using the 07.6G mzaya preflight.');
  console.log('No database was accessed. Use separate, independently reviewed disposable DB configurations.');
  return 0;
}
if (require.main === module) process.exitCode = main();
module.exports = { files, inspect, main };
