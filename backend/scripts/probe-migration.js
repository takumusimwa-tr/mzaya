// backend/scripts/probe-migration.js
// Batch 08.6.6D: transactionally test ONE pending SQL migration, then ALWAYS roll it back.
// Purpose: prove whether a partially-existing staging schema can accept the migration.
// This script never records schema_migrations and never commits schema changes.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/config/db');

const migrationsDir = path.resolve(__dirname, '../migrations');

function selectedFile() {
  const i = process.argv.indexOf('--file');
  if (i < 0 || !process.argv[i + 1]) throw new Error('Usage: node scripts/probe-migration.js --file <migration.sql>');
  const file = process.argv[i + 1];
  if (path.basename(file) !== file || !file.endsWith('.sql')) throw new Error('Migration must be a .sql filename, not a path.');
  const full = path.join(migrationsDir, file);
  if (!fs.existsSync(full)) throw new Error(`Migration not found: ${file}`);
  return { file, full };
}

(async () => {
  let tx;
  try {
    const { file, full } = selectedFile();
    await sequelize.authenticate();

    const [recorded] = await sequelize.query(
      `SELECT filename FROM schema_migrations WHERE filename = :file LIMIT 1`,
      { replacements: { file } }
    );
    if (recorded.length) throw new Error(`${file} is already recorded as applied; refusing to probe it.`);

    const sql = fs.readFileSync(full, 'utf8');
    console.log(`\nPROBE ONLY: ${file}`);
    console.log('Executing inside a transaction that will ALWAYS be rolled back.\n');

    tx = await sequelize.transaction();
    const started = Date.now();
    await sequelize.query(sql, { transaction: tx });

    // Force PostgreSQL to validate deferred constraints before reporting success.
    await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE', { transaction: tx });
    await tx.rollback();
    tx = null;

    console.log(`PROBE PASS (${Date.now() - started}ms): migration SQL completed successfully.`);
    console.log('ROLLBACK COMPLETE: no migration schema changes were committed.');
    console.log('schema_migrations was not modified.\n');
    await sequelize.close();
  } catch (err) {
    if (tx) {
      try { await tx.rollback(); } catch (_) {}
    }
    try { await sequelize.close(); } catch (_) {}
    console.error(`PROBE FAIL: ${err.message}`);
    console.error('ROLLBACK COMPLETE (where transaction creation succeeded). No migration was recorded.');
    process.exit(1);
  }
})();
