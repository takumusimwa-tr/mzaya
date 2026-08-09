const cron = require('node-cron');
const {
  buildReliabilitySnapshot,
} = require('../services/financeReliability.service');

function startFinanceReliabilitySnapshotJob({ logger = console } = {}) {
  return cron.schedule('*/15 * * * *', async () => {
    try {
      await buildReliabilitySnapshot({});
    } catch (error) {
      logger.error?.('finance_reliability_snapshot_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startFinanceReliabilitySnapshotJob,
};
