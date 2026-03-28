const cron = require('node-cron');
const { fetchZigRate } = require('../services/currency.service');

// ─── Runs every day at 08:00 AM Zimbabwe time (CAT = UTC+2) ──────────────────
// RBZ typically announces daily rates in the morning
function startCurrencySyncJob() {
  cron.schedule('0 6 * * *', async () => {
    console.log('[CurrencySync] Refreshing ZiG rate...');
    try {
      const rate = await fetchZigRate();
      console.log(`[CurrencySync] ZiG rate updated: 1 USD = ${rate} ZiG`);
    } catch (err) {
      console.error('[CurrencySync] Failed to refresh rate:', err.message);
    }
  }, {
    timezone: 'Africa/Harare',
  });

  console.log('[CurrencySync] Daily rate sync job scheduled (08:00 CAT)');
}

module.exports = { startCurrencySyncJob };