const cron = require('node-cron');
const { Op } = require('sequelize');
const { TaxTransaction } = require('../models/associations');
const {
  reconcileTaxTransaction,
} = require('../services/taxReconciliation.service');

function startTaxFinanceReconciliationJob({ logger = console } = {}) {
  return cron.schedule('50 * * * *', async () => {
    const transactions = await TaxTransaction.findAll({
      where: {
        status: { [Op.in]: ['recognized', 'reversed'] },
        [Op.or]: [
          { finance_reconciliation_status: { [Op.ne]: 'matched' } },
          { finance_reconciliation_status: null },
        ],
      },
      order: [['updated_at', 'ASC']],
      limit: 100,
    });

    for (const item of transactions) {
      try {
        await reconcileTaxTransaction(item.id);
      } catch (error) {
        logger.error?.('tax_finance_reconciliation_failed', {
          taxTransactionId: item.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startTaxFinanceReconciliationJob,
};
