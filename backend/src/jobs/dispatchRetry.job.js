const cron = require('node-cron');
const { expireOffersAndRedispatch } = require('../services/dispatch.service');
const { logger } = require('../utils/logger');

let task = null;

function startDispatchRetryJob() {
  if (task) return task;

  task = cron.schedule('*/15 * * * * *', async () => {
    try {
      const results = await expireOffersAndRedispatch();
      if (results.length) {
        logger.info('dispatch_retry_completed', { results });
      }
    } catch (error) {
      logger.error('dispatch_retry_failed', { error: error.message });
    }
  });

  return task;
}

function stopDispatchRetryJob() {
  task?.stop();
  task = null;
}

module.exports = { startDispatchRetryJob, stopDispatchRetryJob };
