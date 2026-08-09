const crypto = require('crypto');
const {
  MzayaPayout,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  MzayaPayoutFinanceReconciliationResult,
} = require('../models/associations');

async function reconcileMzayaPayout(payoutId) {
  const payout = await MzayaPayout.findByPk(payoutId);

  if (!payout) {
    const error = new Error('Mzaya payout not found');
    error.status = 404;
    throw error;
  }

  const eventType =
    payout.status === 'paid'
      ? 'mzaya.payout_paid'
      : 'mzaya.payout_due';

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'mzaya_payout',
      aggregate_id: payout.id,
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
    exceptionCode = 'MZAYA_PAYOUT_WITHOUT_OUTBOX';
    exceptionMessage = 'Mzaya payout has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'MZAYA_PAYOUT_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Mzaya payout outbox event has no finance event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'MZAYA_PAYOUT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Mzaya payout finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent) {
    exceptionCode = 'MZAYA_PAYOUT_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Mzaya payout accounting event has not posted to the ledger.';
  }

  const expected =
    eventType === 'mzaya.payout_paid'
      ? Number(payout.amount_paid_minor || 0)
      : Number(payout.amount_due_minor || 0);

  const observed = businessEvent
    ? Number(
        eventType === 'mzaya.payout_paid'
          ? businessEvent.payload?.amountPaidMinor || 0
          : businessEvent.payload?.amountDueMinor || 0
      )
    : null;

  if (!exceptionCode && observed !== expected) {
    exceptionCode = 'MZAYA_PAYOUT_AMOUNT_MISMATCH';
    exceptionMessage = 'Mzaya payout amount differs from finance event amount.';
  }

  if (
    !exceptionCode &&
    businessEvent &&
    String(payout.currency).toUpperCase() !==
      String(businessEvent.payload?.currency || '').toUpperCase()
  ) {
    exceptionCode = 'MZAYA_PAYOUT_CURRENCY_MISMATCH';
    exceptionMessage = 'Mzaya payout and finance event currencies differ.';
  }

  const result =
    await MzayaPayoutFinanceReconciliationResult.create({
      payout_id: payout.id,
      result_reference:
        `MPR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      status: exceptionCode ? 'exception' : 'matched',
      exception_code: exceptionCode,
      exception_message: exceptionMessage,
      outbox_event_id: outbox?.id || null,
      finance_business_event_id: businessEvent?.id || null,
      accounting_event_id: accountingEvent?.id || null,
      ledger_transaction_id: ledger?.id || null,
      expected_amount_minor: expected,
      observed_amount_minor: observed,
      currency: payout.currency,
    });

  await payout.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileMzayaPayout,
};
