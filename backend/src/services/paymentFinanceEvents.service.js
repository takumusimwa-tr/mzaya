const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function paymentBasePayload(payment) {
  return {
    paymentId: payment.id,
    orderId: payment.order_id || null,
    customerId: payment.user_id || payment.customer_id || null,
    provider: payment.provider || payment.payment_provider || 'unknown',
    providerReference:
      payment.provider_reference ||
      payment.reference ||
      payment.transaction_reference ||
      null,
    currency: String(payment.currency || 'USD').toUpperCase(),
    amountMinor: Number(payment.amount_minor ?? payment.amount ?? 0),
  };
}

async function emitPaymentAuthorized({ payment, transaction }) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: payment.id,
    eventType: 'payment.authorized',
    sourceSystem: 'payments',
    payload: paymentBasePayload(payment),
    idempotencyKey: `payment:${payment.id}:authorized:v1`,
  });
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

async function emitPaymentFailed({ payment, transaction, reason = null }) {
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
    idempotencyKey: `payment:${payment.id}:gateway_fee:${feeMinor}:v1`,
  });
}

module.exports = {
  paymentBasePayload,
  emitPaymentAuthorized,
  emitPaymentCaptured,
  emitPaymentFailed,
  emitGatewayFeePosted,
};
