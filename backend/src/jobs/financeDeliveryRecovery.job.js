const cron = require('node-cron');
const {
  recoverStaleLeases,
} = require('../services/financeEventRecovery.service');

function startFinanceDeliveryRecoveryJob({ logger = console } = {}) {
  return cron.schedule('*/5 * * * *', async () => {
    try {
      const recovered = await recoverStaleLeases();

      if (recovered > 0) {
        logger.warn?.('finance_delivery_stale_leases_recovered', {
          recovered,
        });
      }
    } catch (error) {
      logger.error?.('finance_delivery_recovery_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startFinanceDeliveryRecoveryJob,
};
