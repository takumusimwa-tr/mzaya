const { sequelize } = require('../config/db');
const {
  FinanceAccountingEvent,
  FinanceBusinessEvent,
} = require('../models/associations');
const {
  resolveFinanceAccount,
} = require('./financeAccountResolver.service');
const {
  postLedgerTransaction,
} = require('./ledger.service');
const {
  financeEventEngineEvents,
  FINANCE_EVENT_ENGINE_EVENT,
} = require('../events/financeEventEngine.events');

function positiveJournalLines(journalPayload = {}) {
  return (journalPayload.lines || []).filter(
    (line) => Number(line.amountMinor || 0) > 0
  );
}

async function postAccountingEvent({
  accountingEventId,
  createdBy = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const accountingEvent =
      await FinanceAccountingEvent.findByPk(accountingEventId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!accountingEvent) {
      const error = new Error('Finance accounting event not found');
      error.status = 404;
      error.code = 'FINANCE_ACCOUNTING_EVENT_NOT_FOUND';
      throw error;
    }

    if (accountingEvent.status === 'posted') {
      return accountingEvent;
    }

    if (accountingEvent.status !== 'prepared') {
      const error = new Error(
        `Accounting event is not postable from status ${accountingEvent.status}`
      );
      error.status = 409;
      error.code = 'FINANCE_ACCOUNTING_EVENT_NOT_PREPARED';
      throw error;
    }

    const businessEvent = await FinanceBusinessEvent.findByPk(
      accountingEvent.business_event_id,
      { transaction }
    );

    if (!businessEvent) {
      const error = new Error('Accounting event business event not found');
      error.status = 409;
      error.code = 'FINANCE_BUSINESS_EVENT_MISSING';
      throw error;
    }

    const journal = accountingEvent.journal_payload || {};
    const lines = positiveJournalLines(journal);

    // Some approval/cancellation templates are intentionally trace-only.
    // Keep them in the accounting event audit trail without creating zero-value
    // ledger entries (the ledger correctly rejects zero-value postings).
    if (lines.length === 0) {
      await accountingEvent.update({
        status: 'posted',
        posted_at: new Date(),
        metadata: {
          ...(accountingEvent.metadata || {}),
          nonPosting: true,
          nonPostingReason: 'zero_value_trace_event',
        },
      }, { transaction });

      await businessEvent.update({
        status: 'posted',
        processed_at: businessEvent.processed_at || new Date(),
      }, { transaction });

      return accountingEvent;
    }

    if (lines.length < 2) {
      const error = new Error(
        'Positive finance journal requires at least two ledger lines'
      );
      error.status = 422;
      error.code = 'FINANCE_LEDGER_LINES_INSUFFICIENT';
      throw error;
    }

    const ledgerEntries = [];
    for (const line of lines) {
      const account = await resolveFinanceAccount({
        accountCode: line.accountCode,
        currency: accountingEvent.currency,
        payload: businessEvent.payload || {},
        transaction,
      });

      ledgerEntries.push({
        accountId: account.id,
        direction: line.direction,
        amountMinor: Number(line.amountMinor),
        metadata: {
          accountCode: line.accountCode,
          accountingEventId: accountingEvent.id,
          businessEventId: businessEvent.id,
          dimensions: line.dimensions || {},
        },
      });
    }

    const ledgerTransaction = await postLedgerTransaction({
      reference: accountingEvent.accounting_reference,
      transactionType: businessEvent.event_type,
      currency: accountingEvent.currency,
      entries: ledgerEntries,
      orderId: businessEvent.payload?.orderId || null,
      paymentId: businessEvent.payload?.paymentId || null,
      description: `Finance event: ${businessEvent.event_type}`,
      metadata: {
        financeBusinessEventId: businessEvent.id,
        financeAccountingEventId: accountingEvent.id,
        sourceSystem: businessEvent.source_system,
      },
      createdBy,
      externalTransaction: transaction,
    });

    await accountingEvent.update({
      status: 'posted',
      ledger_transaction_id: ledgerTransaction.id,
      posted_at: new Date(),
      failure_reason: null,
    }, { transaction });

    await businessEvent.update({
      status: 'posted',
      processed_at: businessEvent.processed_at || new Date(),
      failure_reason: null,
    }, { transaction });

    transaction.afterCommit(() => {
      financeEventEngineEvents.emit(
        FINANCE_EVENT_ENGINE_EVENT.ACCOUNTING_EVENT_POSTED,
        {
          businessEventId: businessEvent.id,
          accountingEventId: accountingEvent.id,
          ledgerTransactionId: ledgerTransaction.id,
        }
      );
    });

    return accountingEvent;
  });
}

module.exports = {
  positiveJournalLines,
  postAccountingEvent,
};
