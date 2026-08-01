const cron = require('node-cron');
const {
  createLiquiditySnapshot,
} = require('../services/liquiditySnapshot.service');

const currencies = String(
  process.env.TREASURY_SNAPSHOT_CURRENCIES || 'USD,ZWL'
)
  .split(',')
  .map((item) => item.trim().toUpperCase())
  .filter(Boolean);

function startLiquiditySnapshotJob({ logger = console } = {}) {
  return cron.schedule('20 0 * * *', async () => {
    const snapshotDate = new Date().toISOString().slice(0, 10);

    for (const currency of currencies) {
      try {
        await createLiquiditySnapshot({
          snapshotDate,
          currency,
        });
      } catch (error) {
        logger.error?.('liquidity_snapshot_failed', {
          currency,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startLiquiditySnapshotJob };
