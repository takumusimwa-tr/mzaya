const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function usdToMinor(value) {
  return Math.round(Number(value || 0) * 100);
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function moneyMinor(order, minorField, usdField) {
  const minorValue = firstDefined(order[minorField]);

  if (minorValue !== undefined) {
    return Math.round(Number(minorValue || 0));
  }

  return usdToMinor(order[usdField]);
}

function normalizeOrderType(orderType) {
  const value = String(orderType || '').toLowerCase();
  const aliases = {
    food: 'food',
    orderfood: 'food',
    grocery: 'grocery',
    ordergrocery: 'grocery',
    materials: 'materials',
    material: 'materials',
    ordermaterials: 'materials',
    ordermaterial: 'materials',
    errand: 'errand',
    ordererrand: 'errand',
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
    currency: String(
      firstDefined(order.currency_paid, order.currency, 'USD')
    ).toUpperCase(),
    grossOrderValueMinor: moneyMinor(order, 'total_amount_minor', 'total_usd'),
    merchandiseValueMinor: moneyMinor(order, 'subtotal_minor', 'subtotal_usd'),
    deliveryFeeMinor: moneyMinor(order, 'delivery_fee_minor', 'delivery_fee_usd'),
    platformFeeMinor: moneyMinor(order, 'service_fee_minor', 'service_fee_usd'),
    procurementFeeMinor: moneyMinor(
      order,
      'procurement_fee_minor',
      'procurement_fee_usd'
    ),
    taxMinor: moneyMinor(order, 'tax_minor', 'tax_usd'),
    discountMinor: moneyMinor(order, 'discount_minor', 'discount_usd'),
    tipMinor: moneyMinor(order, 'tip_minor', 'tip_usd'),
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
