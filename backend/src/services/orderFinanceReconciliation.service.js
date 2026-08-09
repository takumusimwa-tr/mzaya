const crypto = require('crypto');
const {
  Order,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  OrderFinanceReconciliationResult,
} = require('../models/associations');
const {
  usdToMinor,
} = require('./orderFinanceEvents.service');

async function reconcileOrder({
  orderId,
  orderType = null,
}) {
  const order = await Order.findByPk(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'order',
      aggregate_id: order.id,
      event_type: 'order.completed',
    },
    order: [['created_at', 'DESC']],
  });

  let businessEvent = null;
  let accountingEvent = null;
  let ledger = null;
  let exceptionCode = null;
  let exceptionMessage = null;

  if (!outbox) {
    exceptionCode = 'COMPLETED_ORDER_WITHOUT_OUTBOX';
    exceptionMessage = 'Completed order has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });
    if (!businessEvent) {
      exceptionCode = 'ORDER_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage =
        'Order outbox event has no finance business event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });
    if (!accountingEvent) {
      exceptionCode =
        'ORDER_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage =
        'Order finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent) {
    exceptionCode = 'ORDER_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage =
      'Order accounting event has not reached the ledger.';
  }

  const expectedGov = usdToMinor(order.total_usd);
  const observedGov = businessEvent
    ? Number(businessEvent.payload?.grossOrderValueMinor || 0)
    : null;

  if (
    !exceptionCode &&
    observedGov != null &&
    expectedGov !== observedGov
  ) {
    exceptionCode = 'ORDER_GOV_MISMATCH';
    exceptionMessage =
      'Operational order value differs from finance event value.';
  }

  const result = await OrderFinanceReconciliationResult.create({
    order_id: order.id,
    order_type: orderType || order.category_type,
    result_reference:
      `OFR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    status: exceptionCode ? 'exception' : 'matched',
    exception_code: exceptionCode,
    exception_message: exceptionMessage,
    outbox_event_id: outbox?.id || null,
    finance_business_event_id: businessEvent?.id || null,
    accounting_event_id: accountingEvent?.id || null,
    ledger_transaction_id: ledger?.id || null,
    expected_gov_minor: expectedGov,
    observed_gov_minor: observedGov,
    expected_delivery_fee_minor: usdToMinor(order.delivery_fee_usd),
    observed_delivery_fee_minor:
      businessEvent?.payload?.deliveryFeeMinor ?? null,
    expected_platform_fee_minor: 0,
    observed_platform_fee_minor:
      businessEvent?.payload?.platformFeeMinor ?? null,
    currency: order.currency_paid || 'USD',
  });

  await order.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileOrder,
};
