const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

async function emitRefundRequested({
  payment,
  refund,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment_refund',
    aggregateId: refund.id,
    eventType: 'payment.refund_requested',
    sourceSystem: 'payments',
    payload: {
      paymentId: payment.id,
      refundId: refund.id,
      refundReference: refund.refund_reference,
      currency: refund.currency,
      amountMinor: Number(refund.amount_minor),
      reason: refund.reason || null,
    },
    idempotencyKey: `refund:${refund.id}:requested:v1`,
  });
}

async function emitRefundCompleted({
  payment,
  refund,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment_refund',
    aggregateId: refund.id,
    eventType: 'payment.refunded',
    sourceSystem: 'payments',
    payload: {
      paymentId: payment.id,
      refundId: refund.id,
      refundReference: refund.refund_reference,
      providerRefundReference: refund.provider_refund_reference || null,
      currency: refund.currency,
      amountMinor: Number(refund.amount_minor),
    },
    idempotencyKey: `refund:${refund.id}:completed:v1`,
  });
}

async function emitChargeback({
  payment,
  chargebackReference,
  amountMinor,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: payment.id,
    eventType: 'payment.chargeback',
    sourceSystem: 'payments',
    payload: {
      paymentId: payment.id,
      chargebackReference,
      currency: payment.currency,
      amountMinor: Number(amountMinor),
    },
    idempotencyKey:
      `payment:${payment.id}:chargeback:${chargebackReference}:v1`,
  });
}

module.exports = {
  emitRefundRequested,
  emitRefundCompleted,
  emitChargeback,
};
