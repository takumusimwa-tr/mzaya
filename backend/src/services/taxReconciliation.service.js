const crypto = require('crypto');
const {
  TaxTransaction,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  TaxFinanceReconciliationResult,
} = require('../models/associations');

async function reconcileTaxTransaction(taxTransactionId) {
  const taxTransaction = await TaxTransaction.findByPk(taxTransactionId);

  if (!taxTransaction) {
    const error = new Error('Tax transaction not found');
    error.status = 404;
    throw error;
  }

  const eventType =
    taxTransaction.status === 'reversed'
      ? 'tax.liability_reversed'
      : 'tax.liability_created';

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'tax_transaction',
      aggregate_id: taxTransaction.id,
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
    exceptionCode = 'TAX_TRANSACTION_WITHOUT_OUTBOX';
    exceptionMessage = 'Tax transaction has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'TAX_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Tax outbox event has no finance business event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'TAX_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Tax finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent) {
    exceptionCode = 'TAX_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Tax accounting event has not posted to the ledger.';
  }

  const expected = Number(taxTransaction.tax_amount_minor || 0);
  const observed = businessEvent
    ? Number(businessEvent.payload?.taxAmountMinor || 0)
    : null;

  if (!exceptionCode && observed !== expected) {
    exceptionCode = 'TAX_AMOUNT_MISMATCH';
    exceptionMessage = 'Tax transaction amount differs from finance event amount.';
  }

  if (
    !exceptionCode &&
    businessEvent &&
    String(taxTransaction.currency).toUpperCase() !==
      String(businessEvent.payload?.currency || '').toUpperCase()
  ) {
    exceptionCode = 'TAX_CURRENCY_MISMATCH';
    exceptionMessage = 'Tax transaction and finance event currencies differ.';
  }

  const result = await TaxFinanceReconciliationResult.create({
    tax_transaction_id: taxTransaction.id,
    result_reference:
      `TXR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    status: exceptionCode ? 'exception' : 'matched',
    exception_code: exceptionCode,
    exception_message: exceptionMessage,
    outbox_event_id: outbox?.id || null,
    finance_business_event_id: businessEvent?.id || null,
    accounting_event_id: accountingEvent?.id || null,
    ledger_transaction_id: ledger?.id || null,
    expected_tax_minor: expected,
    observed_tax_minor: observed,
    currency: taxTransaction.currency,
  });

  await taxTransaction.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileTaxTransaction,
};
