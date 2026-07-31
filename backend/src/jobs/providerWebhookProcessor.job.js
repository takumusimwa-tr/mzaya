const cron = require('node-cron');
const {
  processDueWebhookEvents,
} = require('../services/providerWebhookProcessor.service');

function startProviderWebhookProcessor({
  logger = console,
} = {}) {
  return cron.schedule('*/2 * * * *', () => {
    processDueWebhookEvents({ limit: 100 })
      .then((results) => {
        logger.info?.('provider_webhook_batch_processed', {
          processed: results.filter(Boolean).length,
          attempted: results.length,
        });
      })
      .catch((error) => {
        logger.error?.('provider_webhook_processor_failed', {
          error: error.message,
        });
      });
  });
}

module.exports = {
  startProviderWebhookProcessor,
};
