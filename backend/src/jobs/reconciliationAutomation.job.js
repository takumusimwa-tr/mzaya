const cron = require('node-cron');

/**
 * Adapter injection keeps provider-specific statement fetching isolated.
 */
function startReconciliationAutomation({
  providers = [],
  runAutomatedReconciliation,
  logger = console,
} = {}) {
  return cron.schedule('20 3 * * *', async () => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    const statementDate = date.toISOString().slice(0, 10);

    for (const provider of providers) {
      try {
        await runAutomatedReconciliation({
          provider: provider.name,
          statementDate,
          adapter: provider.adapter,
        });
      } catch (error) {
        logger.error?.('automated_reconciliation_failed', {
          provider: provider.name,
          statementDate,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startReconciliationAutomation,
};
