const cron = require('node-cron');
const {
  createFinanceSnapshot,
} = require('../services/financeSnapshot.service');

const SNAPSHOT_CURRENCIES = String(
  process.env.FINANCE_SNAPSHOT_CURRENCIES || 'USD,ZWL'
)
  .split(',')
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

async function createPreviousDaySnapshots({ logger = console } = {}) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  const snapshotDate = date.toISOString().slice(0, 10);

  const snapshots = [];

  for (const currency of SNAPSHOT_CURRENCIES) {
    try {
      snapshots.push(await createFinanceSnapshot({
        snapshotDate,
        currency,
      }));
    } catch (error) {
      logger.error?.('finance_snapshot_failed', {
        snapshotDate,
        currency,
        error: error.message,
      });
    }
  }

  return snapshots;
}

function startFinanceSnapshotJob({ logger = console } = {}) {
  return cron.schedule('30 0 * * *', () => {
    createPreviousDaySnapshots({ logger }).catch((error) => {
      logger.error?.('finance_snapshot_job_failed', {
        error: error.message,
      });
    });
  });
}

module.exports = {
  createPreviousDaySnapshots,
  startFinanceSnapshotJob,
};
