const cron = require('node-cron');
const {
  calculateCurrencyExposure,
} = require('../services/fxExposure.service');
const {
  evaluateTreasuryLimits,
} = require('../services/treasuryRisk.service');

const currencies = String(
  process.env.TREASURY_EXPOSURE_CURRENCIES || 'USD,ZWL'
)
  .split(',')
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

function startTreasuryExposureJob({ logger = console } = {}) {
  return cron.schedule('45 0 * * *', async () => {
    const exposureDate = new Date().toISOString().slice(0, 10);
    const reportingCurrency =
      process.env.TREASURY_REPORTING_CURRENCY || 'USD';

    for (const currency of currencies) {
      try {
        const exposure = await calculateCurrencyExposure({
          currency,
          reportingCurrency,
          exposureDate,
        });

        await evaluateTreasuryLimits({
          currency,
          exposureMinor: exposure.net_exposure_minor,
        });
      } catch (error) {
        logger.error?.('treasury_exposure_job_failed', {
          currency,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startTreasuryExposureJob,
};
