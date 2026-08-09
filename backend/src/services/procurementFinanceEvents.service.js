const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function procurementPayload(procurement) {
  return {
    procurementId: procurement.id,
    procurementReference: procurement.procurement_reference,
    customerId: procurement.customer_id || null,
    vendorId: procurement.vendor_id || null,
    orderId: procurement.order_id || null,
    orderType: procurement.order_type || null,
    currency: procurement.currency,
    merchandiseCostMinor: Number(procurement.merchandise_cost_minor || 0),
    procurementFeeMinor: Number(procurement.procurement_fee_minor || 0),
    deliveryFeeMinor: Number(procurement.delivery_fee_minor || 0),
    taxMinor: Number(procurement.tax_minor || 0),
    discountMinor: Number(procurement.discount_minor || 0),
    reimbursementMinor: Number(procurement.reimbursement_minor || 0),
    amountAuthorizedMinor: Number(procurement.amount_authorized_minor || 0),
    amountSpentMinor: Number(procurement.amount_spent_minor || 0),
    amountRefundableMinor: Number(procurement.amount_refundable_minor || 0),
  };
}

async function emitProcurementApproved({
  procurement,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'procurement',
    aggregateId: procurement.id,
    eventType: 'procurement.approved',
    sourceSystem: 'procurement',
    payload: procurementPayload(procurement),
    idempotencyKey:
      `procurement:${procurement.id}:approved:v1`,
  });
}

async function emitProcurementCompleted({
  procurement,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'procurement',
    aggregateId: procurement.id,
    eventType: 'procurement.completed',
    sourceSystem: 'procurement',
    payload: procurementPayload(procurement),
    idempotencyKey:
      `procurement:${procurement.id}:completed:v1`,
  });
}

async function emitProcurementRefundDue({
  procurement,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'procurement',
    aggregateId: procurement.id,
    eventType: 'procurement.refund_due',
    sourceSystem: 'procurement',
    payload: procurementPayload(procurement),
    idempotencyKey:
      `procurement:${procurement.id}:refund_due:v1`,
  });
}

module.exports = {
  procurementPayload,
  emitProcurementApproved,
  emitProcurementCompleted,
  emitProcurementRefundDue,
};
