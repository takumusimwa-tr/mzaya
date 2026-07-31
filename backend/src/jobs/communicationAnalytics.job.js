const cron = require('node-cron');
const {
  aggregateDailyCommunicationMetrics,
} = require('../services/communicationAnalytics.service');

function startCommunicationAnalyticsJob({ logger = console } = {}) {
  return cron.schedule('15 0 * * *', async () => {
    const previousDay = new Date();
    previousDay.setUTCDate(previousDay.getUTCDate() - 1);

    try {
      const metrics = await aggregateDailyCommunicationMetrics(previousDay);
      logger.info?.('communication_daily_metrics_aggregated', { metrics });
    } catch (error) {
      logger.error?.('communication_daily_metrics_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = { startCommunicationAnalyticsJob };
