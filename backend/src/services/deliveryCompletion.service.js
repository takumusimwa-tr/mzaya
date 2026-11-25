const { Rider } = require('../models/associations');
const { emitOrderCompleted } = require('./orderFinanceEvents.service');
const { emitDeliveryCompleted } = require('./deliveryFinanceEvents.service');
const { upsertOrderEconomics } = require('./orderEconomicsIntegration.service');

// Internal helper: caller must hold the order row lock and own the transaction.
// Call exactly once after transitioning an order to delivered, never on replay.
async function applyDeliveryCompletionEffects({ order, transaction }) {
  if (!transaction || order.status !== 'delivered' || !order.delivered_at) {
    throw new Error('Delivery completion requires a delivered order and transaction');
  }
  await emitOrderCompleted({ order, transaction });
  await emitDeliveryCompleted({ order, deliveredAt: order.delivered_at, transaction });
  await upsertOrderEconomics({ order, transaction });

  // Earnings are part of the same commit as delivery and finance events.
  // A failure rolls back all of them, rather than silently losing earnings.
  const rider = await Rider.findOne({
    where: { user_id: order.rider_id }, transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!rider) throw new Error('Mzaya profile not found for delivery earnings');
  const earned = Number(order.delivery_fee_usd || 0) + Number(order.tip_usd || 0);
  await rider.update({
    total_earnings_usd: parseFloat((Number(rider.total_earnings_usd || 0) + earned).toFixed(2)),
    total_deliveries: Number(rider.total_deliveries || 0) + 1,
  }, { transaction });
}

module.exports = { applyDeliveryCompletionEffects };
