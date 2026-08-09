/**
 * Batch 08.5.2 integration example for food orders.
 *
 * Merge this into the EXISTING order completion flow.
 * Do not replace existing matching, status, notification, or delivery logic.
 */
const { sequelize } = require('../config/db');
const {
  emitOrderCompleted,
} = require('./orderFinanceEvents.service');
const {
  emitDeliveryCompleted,
} = require('./deliveryFinanceEvents.service');
const {
  upsertOrderEconomics,
} = require('./orderEconomicsIntegration.service');

async function completeFoodOrderWithFinance({
  OrderModel,
  orderId,
  deliveredAt = new Date(),
  distanceKm = null,
  durationMinutes = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const order = await OrderModel.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    if (['completed', 'delivered'].includes(order.status)) {
      return order;
    }

    await order.update({
      status: 'completed',
      completed_at: deliveredAt,
    }, { transaction });

    await emitOrderCompleted({
      order,
      orderType: 'food',
      transaction,
    });

    await emitDeliveryCompleted({
      order,
      orderType: 'food',
      deliveredAt,
      distanceKm,
      durationMinutes,
      transaction,
    });

    await upsertOrderEconomics({
      order,
      orderType: 'food',
      transaction,
    });

    return order;
  });
}

module.exports = {
  completeFoodOrderWithFinance,
};
