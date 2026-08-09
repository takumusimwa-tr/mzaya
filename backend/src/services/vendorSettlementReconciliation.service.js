const crypto = require('crypto');
const {
  VendorSettlement,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  VendorSettlementFinanceReconciliationResult,
} = require('../models/associations');

async function reconcileVendorSettlement(settlementId) {
  const settlement = await VendorSettlement.findByPk(settlementId);

  if (!settlement) {
    const error = new Error('Vendor settlement not found');
    error.status = 404;
    throw error;
  }

  const eventType =
    settlement.status === 'paid'
      ? 'vendor.settlement_paid'
      : 'vendor.settlement_due';

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'vendor_settlement',
      aggregate_id: settlement.id,
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
    exceptionCode = 'SETTLEMENT_WITHOUT_OUTBOX';
    exceptionMessage = 'Vendor settlement has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'SETTLEMENT_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Vendor settlement outbox event has no finance event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'SETTLEMENT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Vendor settlement finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent) {
    exceptionCode = 'SETTLEMENT_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Vendor settlement accounting event has not posted to the ledger.';
  }

  const expected =
    eventType === 'vendor.settlement_paid'
      ? Number(settlement.amount_paid_minor || 0)
      : Number(settlement.amount_due_minor || 0);

  const observed = businessEvent
    ? Number(
        eventType === 'vendor.settlement_paid'
          ? businessEvent.payload?.amountPaidMinor || 0
          : businessEvent.payload?.amountDueMinor || 0
      )
    : null;

  if (!exceptionCode && observed !== expected) {
    exceptionCode = 'SETTLEMENT_AMOUNT_MISMATCH';
    exceptionMessage = 'Vendor settlement amount differs from finance event amount.';
  }

  if (
    !exceptionCode &&
    businessEvent &&
    String(settlement.currency).toUpperCase() !==
      String(businessEvent.payload?.currency || '').toUpperCase()
  ) {
    exceptionCode = 'SETTLEMENT_CURRENCY_MISMATCH';
    exceptionMessage = 'Vendor settlement and finance event currencies differ.';
  }

  const result =
    await VendorSettlementFinanceReconciliationResult.create({
      settlement_id: settlement.id,
      result_reference:
        `VFR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      status: exceptionCode ? 'exception' : 'matched',
      exception_code: exceptionCode,
      exception_message: exceptionMessage,
      outbox_event_id: outbox?.id || null,
      finance_business_event_id: businessEvent?.id || null,
      accounting_event_id: accountingEvent?.id || null,
      ledger_transaction_id: ledger?.id || null,
      expected_amount_minor: expected,
      observed_amount_minor: observed,
      currency: settlement.currency,
    });

  await settlement.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileVendorSettlement,
};
