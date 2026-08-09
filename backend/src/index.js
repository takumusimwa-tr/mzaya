// backend/src/index.js
//
// The server. The Express app itself lives in app.js — split out so that tests can
// import the API and drive it with supertest without a real server binding a real
// port. This file owns only the things a *process* owns: booting, listening,
// sockets, background jobs, and shutting down cleanly.
//
// Load .env FIRST. Everything below reads process.env, and validateEnv in
// particular will (correctly) refuse to boot against an empty environment.
//
// This was the bug in the app.js/index.js split: app.js loaded dotenv, but
// index.js called validateEnv() *before* it ever required app.js — so the
// validator ran against nothing and reported DB_URL and JWT_SECRET as missing
// when they were sitting in .env the whole time.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Now validate. A misconfigured app should fail loudly at boot, not silently at
// 2am on the first request that happens to need the missing value.
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const http = require('http');
const app = require('./app');   // dotenv is already loaded by the time this runs
const { sequelize, connectDB } = require('./config/db');
const { initSocket } = require('./realtime/socket');
const { logger } = require('./utils/logger');
const { startCurrencySyncJob } = require('./jobs/currencySync.job');
const { startScheduledReleaseJob } = require('./jobs/scheduledRelease.job');
const { startFinanceRuntime } = require('./runtime/financeRuntime');

async function boot() {
  await connectDB();
  // Schema sync.
  //
  // In development, `alter: true` conveniently adds new columns/tables as the
  // models evolve. In PRODUCTION this is dangerous: it inspects and mutates the
  // live schema on every restart, and on a table with real data it can lock,
  // hang, or drop a column it believes is stale. A routine redeploy would become
  // an unintended migration.
  //
  // So: alter in dev, never in production. Production schema changes go through
  // explicit, reviewed migrations.
  const isProd = process.env.NODE_ENV === 'production';

  // Schema.
  //
  // Development: sync({ alter }) conveniently reshapes the schema as models
  // evolve.
  //
  // Production: NOTHING. Not even sync({ alter: false }) — that still creates
  // missing tables, which makes the live schema a function of whatever model code
  // happened to deploy, rather than a reviewed, ordered, reversible migration
  // history. A schema you cannot reproduce or roll back is a schema you cannot
  // trust. Production schema changes run through backend/migrations, applied
  // deliberately before the new code starts.
  if (isProd) {
    logger.info('schema_sync_skipped', { reason: 'production uses migrations' });
  } else {
    await sequelize.sync({ alter: true });
    logger.info('models_synced', { alter: true });
  }

  startCurrencySyncJob();
  startScheduledReleaseJob();

  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  const io = initSocket(server);
  const financeRuntime = await startFinanceRuntime({ io, logger });

  server.listen(PORT, () => {
    logger.info('server_started', {
      port: PORT,
      env:  process.env.NODE_ENV || 'development',
      ml:   process.env.ML_SERVICE_URL || 'http://localhost:8000',
    });
  });

  return { server, io, financeRuntime };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
// A deploy sends SIGTERM and then waits. Without a handler the process is killed
// mid-request: in-flight orders and payment callbacks are simply dropped. And a
// boot failure without a catch leaves an un-handled rejection and a hung process
// instead of a clear error and a non-zero exit the platform can act on.
let handles = null;

boot()
  .then((h) => { handles = h; })
  .catch((err) => {
    logger.error('boot_failed', { error: err.message, stack: err.stack });
    process.exit(1);
  });

async function shutdown(signal) {
  logger.info('shutdown_started', { signal });

  // Give in-flight work a bounded window, then go anyway — a deploy that hangs
  // forever is worse than one that drops a straggler.
  const deadline = setTimeout(() => {
    logger.error('shutdown_forced', { after_ms: 15000 });
    process.exit(1);
  }, 15000);

  try {
    handles?.financeRuntime?.stop?.();
    if (handles?.io)     await new Promise((r) => handles.io.close(r));
    if (handles?.server) await new Promise((r) => handles.server.close(r));
    await sequelize.close();
    clearTimeout(deadline);
    logger.info('shutdown_complete', {});
    process.exit(0);
  } catch (err) {
    logger.error('shutdown_error', { error: err.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// A promise rejection nobody handled is a bug, not a warning. Log it loudly.
process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', { reason: String(reason) });
});
