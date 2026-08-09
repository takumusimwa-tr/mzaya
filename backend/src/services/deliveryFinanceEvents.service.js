const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');
const {
  orderBasePayload,
} = require('./orderFinanceEvents.service');

async function emitDeliveryCompleted({
  order,
  deliveredAt,
  distanceKm = null,
  durationMinutes = null,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'order',
    aggregateId: order.id,
    eventType: 'delivery.completed',
    sourceSystem: 'delivery',
    payload: {
      ...orderBasePayload(order, order.category_type),
      deliveredAt,
      distanceKm,
      durationMinutes,
    },
    idempotencyKey:
      `delivery:${order.id}:completed:v1`,
  });
}

module.exports = {
  emitDeliveryCompleted,
};
