const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  FinanceJournalBatch,
  FinanceAccountingEvent,
  FinanceJournalBatchEvent,
} = require('../models/associations');

async function createJournalBatch({
  accountingEventIds,
  periodKey,
  currency,
  createdBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const events = await FinanceAccountingEvent.findAll({
      where: {
        id: accountingEventIds,
        status: 'prepared',
        currency,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (events.length !== accountingEventIds.length) {
      const error = new Error('One or more accounting events are not batch-ready');
      error.status = 409;
      error.code = 'ACCOUNTING_EVENTS_NOT_READY';
      throw error;
    }

    const debitTotalMinor = events.reduce(
      (sum, event) => sum + Number(event.debit_total_minor || 0),
      0
    );
    const creditTotalMinor = events.reduce(
      (sum, event) => sum + Number(event.credit_total_minor || 0),
      0
    );

    if (debitTotalMinor !== creditTotalMinor) {
      const error = new Error('Journal batch is not balanced');
      error.status = 422;
      error.code = 'FINANCE_BATCH_NOT_BALANCED';
      throw error;
    }

    const batch = await FinanceJournalBatch.create({
      batch_reference:
        `JRN-${periodKey}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      period_key: periodKey,
      currency,
      event_count: events.length,
      debit_total_minor: debitTotalMinor,
      credit_total_minor: creditTotalMinor,
      balanced: true,
      created_by: createdBy,
      status: 'ready',
    }, { transaction });

    await FinanceJournalBatchEvent.bulkCreate(
      events.map((event) => ({
        journal_batch_id: batch.id,
        accounting_event_id: event.id,
      })),
      { transaction }
    );

    return batch;
  });
}

module.exports = {
  createJournalBatch,
};
