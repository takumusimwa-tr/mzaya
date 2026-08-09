const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  FinanceBusinessEvent,
} = require('../models/associations');
const {
  stablePayloadHash,
  assertIdempotentPayload,
} = require('./financeIdempotency.service');
const {
  prepareAccountingEvent,
} = require('./financePostingEngine.service');
const {
  logIntegrationStage,
  recordPostingFailure,
} = require('./financeIntegration.service');
const {
  financeEventEngineEvents,
  FINANCE_EVENT_ENGINE_EVENT,
} = require('../events/financeEventEngine.events');

async function ingestBusinessEvent(input) {
  const existing = await assertIdempotentPayload({
    idempotencyKey: input.idempotencyKey,
    payload: input.payload,
  });

  if (existing) return existing;

  const event = await FinanceBusinessEvent.create({
    event_key:
      input.eventKey ||
      `FBE-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    event_type: input.eventType,
    source_system: input.sourceSystem,
    source_entity_type: input.sourceEntityType || null,
    source_entity_id: input.sourceEntityId || null,
    source_reference: input.sourceReference || null,
    occurred_at: input.occurredAt,
    currency: input.currency || null,
    amount_minor: input.amountMinor ?? null,
    payload: input.payload || {},
    payload_hash: stablePayloadHash(input.payload),
    idempotency_key: input.idempotencyKey,
    status: 'received',
    metadata: input.metadata || {},
  });

  await logIntegrationStage({
    businessEventId: event.id,
    stage: 'ingestion',
    status: 'completed',
    message: 'Business event accepted',
  });

  financeEventEngineEvents.emit(
    FINANCE_EVENT_ENGINE_EVENT.BUSINESS_EVENT_RECEIVED,
    { businessEventId: event.id }
  );

  return event;
}

async function processBusinessEvent({
  businessEventId,
}) {
  const started = Date.now();

  return sequelize.transaction(async (transaction) => {
    const event = await FinanceBusinessEvent.findByPk(businessEventId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!event) {
      const error = new Error('Finance business event not found');
      error.status = 404;
      throw error;
    }

    if (event.status === 'posted' || event.status === 'prepared') {
      return event;
    }

    await event.update({
      status: 'processing',
      processing_attempts: Number(event.processing_attempts || 0) + 1,
    }, { transaction });

    try {
      const accountingEvent = await prepareAccountingEvent(event, { transaction });

      await event.update({
        status: 'prepared',
        processed_at: new Date(),
        failure_reason: null,
      }, { transaction });

      transaction.afterCommit(async () => {
        await logIntegrationStage({
          businessEventId: event.id,
          stage: 'posting_preparation',
          status: 'completed',
          durationMs: Date.now() - started,
          context: { accountingEventId: accountingEvent.id },
        });

        financeEventEngineEvents.emit(
          FINANCE_EVENT_ENGINE_EVENT.ACCOUNTING_EVENT_PREPARED,
          {
            businessEventId: event.id,
            accountingEventId: accountingEvent.id,
          }
        );
      });

      return event;
    } catch (error) {
      await event.update({
        status: 'failed',
        failed_at: new Date(),
        failure_reason: String(error.message || error).slice(0, 1500),
      }, { transaction });

      transaction.afterCommit(async () => {
        const failure = await recordPostingFailure({
          businessEventId: event.id,
          failureCode: error.code || 'FINANCE_EVENT_PROCESSING_FAILED',
          failureStage: 'posting_preparation',
          error,
          context: error.context || {},
        });

        financeEventEngineEvents.emit(
          FINANCE_EVENT_ENGINE_EVENT.POSTING_FAILED,
          {
            businessEventId: event.id,
            failureId: failure.id,
          }
        );
      });

      throw error;
    }
  });
}

module.exports = {
  ingestBusinessEvent,
  processBusinessEvent,
};
