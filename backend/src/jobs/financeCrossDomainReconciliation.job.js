const cron = require('node-cron');
const {
  runCrossDomainReconciliation,
} = require('../services/financeCrossDomainReconciliation.service');

function startFinanceCrossDomainReconciliationJob({
  logger = console,
} = {}) {
  return cron.schedule('5 */2 * * *', async () => {
    try {
      const result = await runCrossDomainReconciliation({});
      logger.info?.('finance_cross_domain_reconciliation_completed', {
        runReference: result.run.run_reference,
        exceptions: result.run.exception_count,
        blockingExceptions: result.run.blocking_exception_count,
      });
    } catch (error) {
      logger.error?.('finance_cross_domain_reconciliation_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = {
  startFinanceCrossDomainReconciliationJob,
};
