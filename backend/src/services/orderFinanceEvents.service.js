const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function normalizeOrderType(orderType) {
  const value = String(orderType || '').toLowerCase();

  const aliases = {
    food: 'food',
    orderfood: 'food',
    grocery: 'grocery',
    ordergrocery: 'grocery',
    materials: 'materials',
    ordermaterials: 'materials',
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
  const normalizedType = normalizeOrderType(orderType);

  return {
    orderId: order.id,
    orderType: normalizedType,
    customerId: order.user_id || order.customer_id || null,
    vendorId: order.vendor_id || order.merchant_id || null,
    mzayaId: order.mzaya_id || order.rider_id || order.driver_id || null,
    cityCode: order.city_code || order.city || null,
    currency: String(order.currency || 'USD').toUpperCase(),
    grossOrderValueMinor: Number(
      order.gross_order_value_minor ??
      order.total_amount_minor ??
      order.total_minor ??
      order.total ??
      0
    ),
    merchandiseValueMinor: Number(
      order.merchandise_value_minor ??
      order.subtotal_minor ??
      order.subtotal ??
      0
    ),
    deliveryFeeMinor: Number(
      order.delivery_fee_minor ??
      order.delivery_fee ??
      0
    ),
    platformFeeMinor: Number(
      order.platform_fee_minor ??
      order.service_fee_minor ??
      order.service_fee ??
      0
    ),
    procurementFeeMinor: Number(
      order.procurement_fee_minor ??
      order.procurement_fee ??
      0
    ),
    taxMinor: Number(
      order.tax_minor ??
      order.tax_amount_minor ??
      order.tax ??
      0
    ),
    discountMinor: Number(
      order.discount_minor ??
      order.discount_amount_minor ??
      order.discount ??
      0
    ),
  };
}

async function emitOrderCompleted({
  order,
  orderType,
  transaction,
}) {
  const normalizedType = normalizeOrderType(orderType);

  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: `${normalizedType}_order`,
    aggregateId: order.id,
    eventType: 'order.completed',
    sourceSystem: 'orders',
    payload: orderBasePayload(order, normalizedType),
    idempotencyKey:
      `order:${normalizedType}:${order.id}:completed:v1`,
  });
}

async function emitOrderCancelled({
  order,
  orderType,
  transaction,
  reason = null,
}) {
  const normalizedType = normalizeOrderType(orderType);

  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: `${normalizedType}_order`,
    aggregateId: order.id,
    eventType: 'order.cancelled',
    sourceSystem: 'orders',
    payload: {
      ...orderBasePayload(order, normalizedType),
      cancellationReason: reason,
    },
    idempotencyKey:
      `order:${normalizedType}:${order.id}:cancelled:v1`,
  });
}

module.exports = {
  normalizeOrderType,
  orderBasePayload,
  emitOrderCompleted,
  emitOrderCancelled,
};
