const crypto = require('crypto');
const {
  TreasuryTransfer,
  BankMovement,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  TreasuryFinanceReconciliationResult,
} = require('../models/associations');
const {
  matchBankMovement,
} = require('./bankMovementMatching.service');

async function reconcileTreasuryTransfer(transferId) {
  const transfer = await TreasuryTransfer.findByPk(transferId);

  if (!transfer) {
    const error = new Error('Treasury transfer not found');
    error.status = 404;
    throw error;
  }

  const outbox = await FinanceOutboxEvent.findOne({
    where: {
      aggregate_type: 'treasury_transfer',
      aggregate_id: transfer.id,
      event_type: 'treasury.transfer_completed',
    },
    order: [['created_at', 'DESC']],
  });

  let businessEvent = null;
  let accountingEvent = null;
  let ledger = null;
  let bankMovement = await BankMovement.findOne({
    where: { treasury_transfer_id: transfer.id },
  });
  let exceptionCode = null;
  let exceptionMessage = null;

  if (!outbox) {
    exceptionCode = 'TREASURY_TRANSFER_WITHOUT_OUTBOX';
    exceptionMessage = 'Completed treasury transfer has no finance outbox event.';
  } else {
    businessEvent = await FinanceBusinessEvent.findOne({
      where: { idempotency_key: outbox.idempotency_key },
    });

    if (!businessEvent) {
      exceptionCode = 'TREASURY_OUTBOX_WITHOUT_FINANCE_EVENT';
      exceptionMessage = 'Treasury outbox event has no finance business event.';
    }
  }

  if (businessEvent) {
    accountingEvent = await FinanceAccountingEvent.findOne({
      where: { business_event_id: businessEvent.id },
    });

    if (!accountingEvent) {
      exceptionCode = 'TREASURY_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT';
      exceptionMessage = 'Treasury finance event has no accounting event.';
    }
  }

  if (accountingEvent?.ledger_transaction_id) {
    ledger = await LedgerTransaction.findByPk(
      accountingEvent.ledger_transaction_id
    );
  } else if (accountingEvent) {
    exceptionCode = 'TREASURY_ACCOUNTING_EVENT_NOT_POSTED';
    exceptionMessage = 'Treasury accounting event has not posted to the ledger.';
  }

  if (!bankMovement) {
    const unmatched = await BankMovement.findAll({
      where: {
        currency: transfer.currency,
        amount_minor: transfer.amount_minor,
        status: 'unmatched',
      },
      limit: 20,
    });

    for (const movement of unmatched) {
      const matched = await matchBankMovement(movement.id);
      if (matched?.id === transfer.id) {
        bankMovement = await BankMovement.findByPk(movement.id);
        break;
      }
    }
  }

  if (!exceptionCode && !bankMovement) {
    exceptionCode = 'TREASURY_TRANSFER_WITHOUT_BANK_MOVEMENT';
    exceptionMessage = 'Completed treasury transfer has no matched bank movement.';
  }

  const expected = Number(transfer.amount_minor || 0);
  const observed = bankMovement
    ? Number(bankMovement.amount_minor || 0)
    : null;

  if (!exceptionCode && observed !== expected) {
    exceptionCode = 'TREASURY_BANK_AMOUNT_MISMATCH';
    exceptionMessage = 'Treasury transfer and bank movement amounts differ.';
  }

  if (
    !exceptionCode &&
    bankMovement &&
    String(bankMovement.currency).toUpperCase() !==
      String(transfer.currency).toUpperCase()
  ) {
    exceptionCode = 'TREASURY_BANK_CURRENCY_MISMATCH';
    exceptionMessage = 'Treasury transfer and bank movement currencies differ.';
  }

  const result = await TreasuryFinanceReconciliationResult.create({
    transfer_id: transfer.id,
    result_reference:
      `TFR-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    status: exceptionCode ? 'exception' : 'matched',
    exception_code: exceptionCode,
    exception_message: exceptionMessage,
    outbox_event_id: outbox?.id || null,
    finance_business_event_id: businessEvent?.id || null,
    accounting_event_id: accountingEvent?.id || null,
    ledger_transaction_id: ledger?.id || null,
    bank_movement_id: bankMovement?.id || null,
    expected_amount_minor: expected,
    observed_amount_minor: observed,
    currency: transfer.currency,
  });

  await transfer.update({
    finance_reconciliation_status:
      exceptionCode ? 'exception' : 'matched',
    finance_last_reconciled_at: new Date(),
  });

  return result;
}

module.exports = {
  reconcileTreasuryTransfer,
};
