const cron = require('node-cron');
const { runDataQualityAssessment } = require('../services/financeDataQuality.service');

function startFinanceDataQualityJob({ logger = console } = {}) {
  return cron.schedule('15 5 * * *', async () => {
    try {
      const { runReference, results } = await runDataQualityAssessment({});
      logger.info?.('finance_data_quality_completed', {
        runReference,
        evaluated: results.length,
        failed: results.filter((item) => item.result === 'failed').length,
      });
    } catch (error) {
      logger.error?.('finance_data_quality_failed', { error: error.message });
    }
  });
}

module.exports = { startFinanceDataQualityJob };
