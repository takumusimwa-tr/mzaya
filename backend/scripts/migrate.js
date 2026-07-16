// backend/scripts/migrate.js
//
// The migration runner.
//
// Production no longer runs sequelize.sync() — deliberately, because a schema
// that's a function of "whatever model code happened to deploy" is a schema you
// can't reproduce, review or roll back. But that left a hole: there was nothing
// to run *instead*. Migrations existed as loose .sql files with no ordering, no
// record of what had been applied, and no way to know whether a given database
// was up to date. You could not safely deploy a schema change at all.
//
// This fixes that. It is small on purpose — a full framework (umzug, sequelize-cli)
// is more machinery than a project this size needs, and its magic is exactly the
// thing you don't want between you and a production database at 2am.
//
// Rules:
//   • Migrations are .sql files in backend/migrations/, applied in FILENAME order.
//     Name them with a sortable prefix: 001_..., 002_..., or a date.
//   • Each runs inside a transaction. A failure rolls back — no half-applied schema.
//   • Applied migrations are recorded in schema_migrations and never re-run.
//   • A migration's contents are hashed. If a file changes after being applied,
//     the runner REFUSES to continue — because that means your database and your
//     repository disagree about what the schema is, and guessing which is right is
//     how you lose data.
//
// Usage:
//   node scripts/migrate.js             apply everything pending
//   node scripts/migrate.js status      show what's applied and what's pending
//   node scripts/migrate.js baseline    adopt an EXISTING database
//
// ── About `baseline` ─────────────────────────────────────────────────────────
// Your dev and staging databases already have migrations applied — by hand, before
// this runner existed. If the runner simply ran everything it found, it would try
// to re-apply them, and re-running a migration that drops a column is how you lose
// data.
//
// `baseline` records every current .sql file as already-applied WITHOUT executing
// it. Run it once, on a database you know is already up to date. From then on, only
// genuinely new migrations run.
//
// On a FRESH database (a new production instance), do NOT baseline — just run
// `migrate`, and everything applies in order from nothing.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sequelize } = require('../src/config/db');
const { QueryTypes } = require('sequelize');

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

async function ensureTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    varchar(255) PRIMARY KEY,
      checksum    varchar(64)  NOT NULL,
      applied_at  timestamptz  NOT NULL DEFAULT now(),
      duration_ms integer
    );
  `);
}

function pendingFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();   // filename order — hence the numeric prefixes
}

async function applied() {
  const rows = await sequelize.query(
    'SELECT filename, checksum FROM schema_migrations',
    { type: QueryTypes.SELECT }
  );
  return new Map(rows.map((r) => [r.filename, r.checksum]));
}

async function status() {
  await ensureTable();
  const done = await applied();
  const files = pendingFiles();

  console.log('\nMigrations\n');
  let pending = 0;

  for (const f of files) {
    const sql  = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    const hash = sha256(sql);

    if (!done.has(f)) {
      console.log(`  PENDING   ${f}`);
      pending++;
    } else if (done.get(f) !== hash) {
      // The file changed after it was applied. Your database and your repo now
      // disagree about the schema, and neither one is obviously right.
      console.log(`  ⚠ CHANGED ${f}  — applied, but the file has been edited since`);
    } else {
      console.log(`  applied   ${f}`);
    }
  }

  console.log(`\n${files.length} migration(s), ${pending} pending.\n`);
  return pending;
}

async function migrate() {
  await ensureTable();
  const done = await applied();
  const files = pendingFiles();

  // Refuse to run if any applied migration has been edited. Silently re-applying
  // or skipping it would both be wrong; the only safe move is to stop and let a
  // human decide.
  for (const f of files) {
    if (!done.has(f)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    if (done.get(f) !== sha256(sql)) {
      console.error(`\n❌ ${f} was already applied but has since been EDITED.`);
      console.error('   The database and the repository no longer agree on the schema.');
      console.error('   Do not "fix" this by editing schema_migrations. Write a NEW');
      console.error('   migration that makes the change you intended.\n');
      process.exit(1);
    }
  }

  const pending = files.filter((f) => !done.has(f));
  if (!pending.length) {
    console.log('Nothing to do — schema is up to date.');
    return;
  }

  console.log(`\nApplying ${pending.length} migration(s)...\n`);

  for (const f of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    const started = Date.now();

    // Each migration is atomic. A failure leaves the schema exactly as it was.
    const tx = await sequelize.transaction();
    try {
      await sequelize.query(sql, { transaction: tx });

      await sequelize.query(
        `INSERT INTO schema_migrations (filename, checksum, duration_ms)
         VALUES (:f, :c, :d)`,
        {
          replacements: { f, c: sha256(sql), d: Date.now() - started },
          transaction: tx,
          type: QueryTypes.INSERT,
        }
      );

      await tx.commit();
      console.log(`  ✅ ${f}  (${Date.now() - started}ms)`);
    } catch (err) {
      await tx.rollback();
      console.error(`  ❌ ${f}`);
      console.error(`     ${err.message}\n`);
      console.error('Rolled back. The schema is unchanged. Nothing after this ran.\n');
      process.exit(1);
    }
  }

  console.log('\nDone.\n');
}

// Adopt an existing database: record every migration as applied, run none of them.
async function baseline() {
  await ensureTable();
  const done = await applied();
  const files = pendingFiles();

  const toMark = files.filter((f) => !done.has(f));
  if (!toMark.length) {
    console.log('Already baselined — every migration is recorded.');
    return;
  }

  console.log('\nBaselining. These will be marked applied WITHOUT running:\n');
  for (const f of toMark) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    await sequelize.query(
      `INSERT INTO schema_migrations (filename, checksum, duration_ms)
       VALUES (:f, :c, 0) ON CONFLICT (filename) DO NOTHING`,
      { replacements: { f, c: sha256(sql) }, type: QueryTypes.INSERT }
    );
    console.log(`  marked  ${f}`);
  }

  console.log('\nDone. Only NEW migrations will run from now on.');
  console.log('⚠  Only do this on a database you KNOW is already up to date.\n');
}

(async () => {
  try {
    await sequelize.authenticate();
    const cmd = process.argv[2];
    if (cmd === 'status')        await status();
    else if (cmd === 'baseline') await baseline();
    else                         await migrate();
    await sequelize.close();
  } catch (err) {
    console.error('Migration runner failed:', err.message);
    process.exit(1);
  }
})();
