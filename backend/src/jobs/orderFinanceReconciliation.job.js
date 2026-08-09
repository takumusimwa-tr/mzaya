const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  OrderFood,
  OrderGrocery,
  OrderMaterials,
} = require('../models/associations');
const {
  reconcileOrder,
} = require('../services/orderFinanceReconciliation.service');

const SOURCES = [
  ['food', OrderFood],
  ['grocery', OrderGrocery],
  ['materials', OrderMaterials],
];

function startOrderFinanceReconciliationJob({ logger = console } = {}) {
  return cron.schedule('15 * * * *', async () => {
    for (const [orderType, Model] of SOURCES) {
      const orders = await Model.findAll({
        where: {
          status: { [Op.in]: ['completed', 'delivered'] },
          [Op.or]: [
            { finance_reconciliation_status: { [Op.ne]: 'matched' } },
            { finance_reconciliation_status: null },
          ],
        },
        order: [['updated_at', 'ASC']],
        limit: 100,
      });

      for (const order of orders) {
        try {
          await reconcileOrder({
            orderId: order.id,
            orderType,
          });
        } catch (error) {
          logger.error?.('order_finance_reconciliation_failed', {
            orderType,
            orderId: order.id,
            error: error.message,
          });
        }
      }
    }
  });
}

module.exports = {
  startOrderFinanceReconciliationJob,
};
