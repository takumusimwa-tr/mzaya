const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  Payment,
} = require('../models/associations');
const {
  reconcilePayment,
} = require('../services/paymentAccountingReconciliation.service');

function startPaymentFinanceReconciliationJob({ logger = console } = {}) {
  return cron.schedule('*/30 * * * *', async () => {
    const payments = await Payment.findAll({
      where: {
        status: { [Op.in]: ['captured', 'paid', 'completed'] },
        [Op.or]: [
          { finance_reconciliation_status: { [Op.ne]: 'matched' } },
          { finance_reconciliation_status: null },
        ],
      },
      order: [['updated_at', 'ASC']],
      limit: 100,
    });

    for (const payment of payments) {
      try {
        await reconcilePayment(payment.id);
      } catch (error) {
        logger.error?.('payment_finance_reconciliation_failed', {
          paymentId: payment.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startPaymentFinanceReconciliationJob,
};
