const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

async function emitRefundCompleted({
  payment,
  refund,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'refund',
    aggregateId: refund.id,
    eventType: 'payment.refunded',
    sourceSystem: 'payments',
    payload: {
      paymentId: payment.id,
      orderId: refund.order_id || payment.order_id || null,
      refundId: refund.id,
      providerRefundReference:
        refund.provider_refund_reference || null,
      currency: refund.currency,
      amountMinor: Number(refund.amount_minor),
    },
    idempotencyKey: `refund:${refund.id}:processed:v1`,
  });
}

module.exports = {
  emitRefundCompleted,
};
