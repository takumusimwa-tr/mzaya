const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');
const {
  orderBasePayload,
  normalizeOrderType,
} = require('./orderFinanceEvents.service');

async function emitDeliveryCompleted({
  order,
  orderType,
  deliveredAt,
  distanceKm = null,
  durationMinutes = null,
  transaction,
}) {
  const normalizedType = normalizeOrderType(orderType);

  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: `${normalizedType}_order`,
    aggregateId: order.id,
    eventType: 'delivery.completed',
    sourceSystem: 'delivery',
    payload: {
      ...orderBasePayload(order, normalizedType),
      deliveredAt,
      distanceKm,
      durationMinutes,
    },
    idempotencyKey:
      `delivery:${normalizedType}:${order.id}:completed:v1`,
  });
}

module.exports = {
  emitDeliveryCompleted,
};
