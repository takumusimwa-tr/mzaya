'use strict';
const { assertIntegrationUrl } = require('../tests/integrationDatabaseGuard');
async function main() {
  assertIntegrationUrl(process.env.TEST_DB_URL);
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.TEST_DB_URL, ssl: false, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const { rows } = await client.query('SELECT current_database() AS name');
    if (rows[0]?.name !== 'mzaya_integration_test') throw new Error('Unsafe database');
    await client.query('ROLLBACK');
    console.log('PASS: Explicit local integration target and connected database verified (read-only)');
  } finally { await client.end(); }
}
main().catch(() => { console.error('STOP: Integration preflight failed; verify TEST_DB_URL and local PostgreSQL availability'); process.exitCode = 1; });
