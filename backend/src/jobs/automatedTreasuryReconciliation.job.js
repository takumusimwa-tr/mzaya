const cron = require('node-cron');
const {
  processUnmatchedBankTransactions,
} = require('../services/automatedTreasuryReconciliation.service');

function startAutomatedTreasuryReconciliation({
  logger = console,
} = {}) {
  return cron.schedule('*/10 * * * *', () => {
    processUnmatchedBankTransactions({ limit: 150 })
      .then((results) => {
        logger.info?.('treasury_reconciliation_batch_completed', {
          attempted: results.length,
          autoMatched: results.filter((item) => item?.autoMatched).length,
        });
      })
      .catch((error) => {
        logger.error?.('treasury_reconciliation_batch_failed', {
          error: error.message,
        });
      });
  });
}

module.exports = {
  startAutomatedTreasuryReconciliation,
};
