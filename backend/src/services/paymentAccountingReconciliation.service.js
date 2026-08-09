const crypto = require('crypto');
const {
  Payment,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  PaymentFinanceReconciliationResult,
} = require('../models/associations');
const {
  accountingEventIsSatisfied,
} = require('./financeReconciliationHelpers.service');

async function reconcilePayment(paymentId) {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'payment',
      aggregate_id: payment.id,
      event_type: 'payment.captured',
    },
    order: [['created_at', 'DESC']],
  });

  let businessEvent = null;
  let accountingEvent = null;
  let ledger = null;
  let exceptionCode = null;
  let exceptionMessage = null;

  if (!outbox) {
    exceptionCode = 'CAPTURE_WITHOUT_OUTBOX';
    exceptionMessage = 'Captured payment has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Published payment outbox event has no finance business event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Payment finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent && !accountingEventIsSatisfied(accountingEvent)) {
    exceptionCode = 'ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Payment accounting event has not reached the ledger.';
  }

  const expected = Math.round(Number(payment.amount_usd || 0) * 100);
  const observed = accountingEvent
    ? Number(accountingEvent.debit_total_minor || 0)
    : null;

  if (
    !exceptionCode &&
    observed != null &&
    expected !== observed
  ) {
    exceptionCode = 'PAYMENT_LEDGER_AMOUNT_MISMATCH';
    exceptionMessage = 'Payment amount differs from accounting event amount.';
  }

  if (
    !exceptionCode &&
    accountingEvent &&
    String(payment.currency).toUpperCase() !==
      String(accountingEvent.currency).toUpperCase()
  ) {
    exceptionCode = 'PAYMENT_ACCOUNTING_CURRENCY_MISMATCH';
    exceptionMessage = 'Payment and accounting currencies differ.';
  }

  const result = await PaymentFinanceReconciliationResult.create({
    payment_id: payment.id,
    result_reference:
      `PFR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    status: exceptionCode ? 'exception' : 'matched',
    exception_code: exceptionCode,
    exception_message: exceptionMessage,
    outbox_event_id: outbox?.id || null,
    finance_business_event_id: businessEvent?.id || null,
    accounting_event_id: accountingEvent?.id || null,
    ledger_transaction_id: ledger?.id || null,
    expected_amount_minor: expected,
    observed_amount_minor: observed,
    currency: payment.currency,
  });

  await payment.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcilePayment,
};
