const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function usdToMinor(value) {
  return Math.round(Number(value || 0) * 100);
}

function normalizeOrderType(orderType) {
  const value = String(orderType || '').toLowerCase();
  const aliases = {
    food: 'food',
    grocery: 'grocery',
    materials: 'materials',
    material: 'materials',
    errand: 'errand',
  };
  const normalized = aliases[value];
  if (!normalized) {
    const error = new Error(`Unsupported order type: ${orderType}`);
    error.status = 422;
    error.code = 'UNSUPPORTED_ORDER_TYPE';
    throw error;
  }
  return normalized;
}

function orderBasePayload(order, orderType) {
  const normalizedType = normalizeOrderType(
    orderType || order.category_type
  );

  return {
    orderId: order.id,
    orderType: normalizedType,
    customerId: order.customer_id || null,
    mzayaId: order.rider_id || null,
    cityCode: order.city || null,
    currency: String(order.currency_paid || 'USD').toUpperCase(),
    grossOrderValueMinor: usdToMinor(order.total_usd),
    merchandiseValueMinor: usdToMinor(order.subtotal_usd),
    deliveryFeeMinor: usdToMinor(order.delivery_fee_usd),
    platformFeeMinor: 0,
    procurementFeeMinor: 0,
    taxMinor: 0,
    discountMinor: usdToMinor(order.discount_usd),
    tipMinor: usdToMinor(order.tip_usd),
  };
}

async function emitOrderCompleted({
  order,
  orderType,
  transaction,
}) {
  const normalizedType = normalizeOrderType(
    orderType || order.category_type
  );

  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'order',
    aggregateId: order.id,
    eventType: 'order.completed',
    sourceSystem: 'orders',
    payload: orderBasePayload(order, normalizedType),
    idempotencyKey:
      `order:${order.id}:completed:v1`,
  });
}

async function emitOrderCancelled({
  order,
  transaction,
  reason = null,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'order',
    aggregateId: order.id,
    eventType: 'order.cancelled',
    sourceSystem: 'orders',
    payload: {
      ...orderBasePayload(order, order.category_type),
      cancellationReason: reason,
    },
    idempotencyKey:
      `order:${order.id}:cancelled:v1`,
  });
}

module.exports = {
  usdToMinor,
  normalizeOrderType,
  orderBasePayload,
  emitOrderCompleted,
  emitOrderCancelled,
};
