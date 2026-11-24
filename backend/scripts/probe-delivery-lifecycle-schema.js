const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { randomUUID } = require('crypto');

async function main() {
  const u = new URL(process.env.TEST_DB_URL || '');
  assert(['postgres:', 'postgresql:'].includes(u.protocol));
  assert(['localhost', '127.0.0.1'].includes(u.hostname));
  assert.equal(u.pathname, '/mzaya_integration_test');
  assert(!u.search && !u.hash);
  const client = new Client({ connectionString: u.href });
  await client.connect();
  try {
    const target = await client.query('SELECT current_database() AS db');
    assert.equal(target.rows[0].db, 'mzaya_integration_test');
    await client.query('BEGIN');
    try {
      const schema = 'delivery_probe_' + randomUUID().replace(/-/g, '');
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(`SET LOCAL search_path TO ${schema}, pg_catalog`);
      await client.query('CREATE TABLE users (id uuid PRIMARY KEY); CREATE TABLE orders (id uuid PRIMARY KEY, status varchar(50));');
      const order = randomUUID(), rider = randomUUID();
      await client.query('INSERT INTO users VALUES ($1)', [rider]);
      await client.query('INSERT INTO orders VALUES ($1, NULL)', [order]);
      const sql = fs.readFileSync(path.join(__dirname, '../migrations/20261124_delivery_lifecycle_schema.sql'), 'utf8');
      await client.query(sql);
      await client.query(sql);
      assert.equal((await client.query('SELECT count(*)::int AS n FROM order_timelines')).rows[0].n, 0);
      await client.query('INSERT INTO delivery_proofs (id, order_id, rider_id, proof_type) VALUES ($1,$2,$3,$4)', [randomUUID(), order, rider, 'photo']);
      await client.query('INSERT INTO order_timelines (order_id,to_status) VALUES ($1,$2)', [order, 'delivered']);
      async function rejectsSql(statement, params, code, constraint) {
        await client.query('SAVEPOINT expected_failure');
        try {
          await assert.rejects(client.query(statement, params), e => (Array.isArray(code) ? code.includes(e.code) : e.code === code) && (!constraint || e.constraint === constraint));
        } finally {
          await client.query('ROLLBACK TO SAVEPOINT expected_failure');
          await client.query('RELEASE SAVEPOINT expected_failure');
        }
      }
      await rejectsSql('INSERT INTO delivery_proofs (id,order_id,rider_id,proof_type) VALUES ($1,$2,$3,$4)', [randomUUID(),order,rider,'photo'], '23505');
      await rejectsSql('INSERT INTO order_timelines (order_id,to_status) VALUES ($1,$2)', [randomUUID(),'delivered'], '23503');
      await rejectsSql('DELETE FROM users WHERE id=$1', [rider], ['23001', '23503'], 'delivery_proofs_rider_id_fkey');
      await client.query('DELETE FROM orders WHERE id=$1', [order]);
      for (const table of ['delivery_proofs','order_timelines']) {
        assert.equal((await client.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n, 0);
      }
      console.log('PASS: SQL replay, no historical backfill, inserts, uniqueness, foreign keys and cascade');
    } finally {
      await client.query('ROLLBACK');
    }
    console.log('PASS: Probe transaction rolled back');
  } finally {
    await client.end();
  }
}
main().catch(error => { console.error('Probe failed:', error.message); process.exitCode = 1; });
