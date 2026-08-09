const crypto = require('crypto');
const {
  ProcurementRun,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  ProcurementFinanceReconciliationResult,
} = require('../models/associations');
const {
  accountingEventIsSatisfied,
} = require('./financeReconciliationHelpers.service');

async function reconcileProcurement(procurementId) {
  const procurement = await ProcurementRun.findByPk(procurementId);

  if (!procurement) {
    const error = new Error('Procurement run not found');
    error.status = 404;
    throw error;
  }

  const eventType =
    procurement.status === 'completed'
      ? 'procurement.completed'
      : 'procurement.approved';

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'procurement',
      aggregate_id: procurement.id,
      event_type: eventType,
    },
    order: [['created_at', 'DESC']],
  });

  let businessEvent = null;
  let accountingEvent = null;
  let ledger = null;
  let exceptionCode = null;
  let exceptionMessage = null;

  if (!outbox) {
    exceptionCode = 'PROCUREMENT_WITHOUT_OUTBOX';
    exceptionMessage = 'Procurement state has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'PROCUREMENT_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Procurement outbox event has no finance business event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'PROCUREMENT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Procurement finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent && !accountingEventIsSatisfied(accountingEvent)) {
    exceptionCode = 'PROCUREMENT_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Procurement accounting event has not posted to the ledger.';
  }

  const expected = Number(procurement.amount_spent_minor || 0);
  const observed = businessEvent
    ? Number(businessEvent.payload?.amountSpentMinor || 0)
    : null;

  if (!exceptionCode && expected !== observed) {
    exceptionCode = 'PROCUREMENT_AMOUNT_MISMATCH';
    exceptionMessage = 'Procurement spend differs from finance event amount.';
  }

  if (
    !exceptionCode &&
    businessEvent &&
    String(procurement.currency).toUpperCase() !==
      String(businessEvent.payload?.currency || '').toUpperCase()
  ) {
    exceptionCode = 'PROCUREMENT_CURRENCY_MISMATCH';
    exceptionMessage = 'Procurement and finance event currencies differ.';
  }

  const result =
    await ProcurementFinanceReconciliationResult.create({
      procurement_id: procurement.id,
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
      currency: procurement.currency,
    });

  await procurement.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileProcurement,
};
