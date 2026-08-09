const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function usdToMinor(value) {
  return Math.round(Number(value || 0) * 100);
}

function paymentBasePayload(payment) {
  return {
    paymentId: payment.id,
    orderId: payment.order_id || null,
    provider: payment.provider || 'paynow',
    providerReference: payment.provider_reference || null,
    currency: String(payment.currency || 'USD').toUpperCase(),
    amountMinor: usdToMinor(payment.amount_usd),
    method: payment.method || null,
  };
}

async function emitPaymentCaptured({ payment, transaction }) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: payment.id,
    eventType: 'payment.captured',
    sourceSystem: 'payments',
    payload: paymentBasePayload(payment),
    idempotencyKey: `payment:${payment.id}:captured:v1`,
  });
}

async function emitPaymentFailed({
  payment,
  transaction,
  reason = null,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: payment.id,
    eventType: 'payment.failed',
    sourceSystem: 'payments',
    payload: {
      ...paymentBasePayload(payment),
      failureReason: reason,
    },
    idempotencyKey: `payment:${payment.id}:failed:v1`,
  });
}

async function emitGatewayFeePosted({
  payment,
  feeMinor,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: payment.id,
    eventType: 'payment.gateway_fee_posted',
    sourceSystem: 'payments',
    payload: {
      ...paymentBasePayload(payment),
      gatewayFeeMinor: Number(feeMinor),
    },
    idempotencyKey:
      `payment:${payment.id}:gateway_fee:${Number(feeMinor)}:v1`,
  });
}

module.exports = {
  usdToMinor,
  paymentBasePayload,
  emitPaymentCaptured,
  emitPaymentFailed,
  emitGatewayFeePosted,
};
