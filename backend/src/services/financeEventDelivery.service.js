const {
  FinanceOutboxEvent,
  FinanceDeliveryAttempt,
} = require('../models/associations');
const {
  acquireDeliveryLease,
  releaseDeliveryLease,
} = require('./financeDeliveryLease.service');
const {
  ingestBusinessEvent,
} = require('./financeEventEngine.service');
const {
  financeDeliveryEvents,
  FINANCE_DELIVERY_EVENT,
} = require('../events/financeDelivery.events');

const MAX_ATTEMPTS = 8;

function computeBackoffMs(attempt) {
  const minutes = Math.min(360, 2 ** Math.min(Number(attempt || 1), 8));
  return minutes * 60 * 1000;
}

async function deliverOutboxEvent({
  outboxEventId,
  workerId,
}) {
  const lease = await acquireDeliveryLease({
    outboxEventId,
    workerId,
  });

  if (!lease) return null;

  const outbox = await FinanceOutboxEvent.findByPk(outboxEventId);
  const attemptNumber = Number(outbox.attempt_count || 0) + 1;
  const startedAt = Date.now();

  const attempt = await FinanceDeliveryAttempt.create({
    outbox_event_id: outbox.id,
    attempt_number: attemptNumber,
    worker_id: workerId,
    status: 'processing',
  });

  try {
    const event = await ingestBusinessEvent({
      eventType: outbox.event_type,
      sourceSystem: outbox.source_system,
      sourceEntityType: outbox.aggregate_type,
      sourceEntityId: outbox.aggregate_id,
      sourceReference: outbox.event_key,
      occurredAt: outbox.created_at,
      currency: outbox.payload?.currency || null,
      amountMinor: outbox.payload?.amountMinor ?? null,
      payload: outbox.payload,
      idempotencyKey: outbox.idempotency_key,
      metadata: {
        ...outbox.metadata,
        outboxEventId: outbox.id,
      },
    });

    await attempt.update({
      status: 'delivered',
      completed_at: new Date(),
      duration_ms: Date.now() - startedAt,
      response_reference: event.id,
    });

    await outbox.update({
      status: 'published',
      published_at: new Date(),
      attempt_count: attemptNumber,
      last_error: null,
    });

    await releaseDeliveryLease({
      leaseId: lease.id,
      status: 'released',
    });

    financeDeliveryEvents.emit(
      FINANCE_DELIVERY_EVENT.OUTBOX_PUBLISHED,
      {
        outboxEventId: outbox.id,
        businessEventId: event.id,
      }
    );

    return { outbox, event, attempt };
  } catch (error) {
    const deadLetter = attemptNumber >= MAX_ATTEMPTS;

    await attempt.update({
      status: 'failed',
      completed_at: new Date(),
      duration_ms: Date.now() - startedAt,
      error_code: error.code || 'OUTBOX_DELIVERY_FAILED',
      error_message: String(error.message || error).slice(0, 1500),
    });

    await outbox.update({
      status: deadLetter ? 'dead_letter' : 'retry',
      available_at: new Date(Date.now() + computeBackoffMs(attemptNumber)),
      attempt_count: attemptNumber,
      last_error: String(error.message || error).slice(0, 1500),
    });

    await releaseDeliveryLease({
      leaseId: lease.id,
      status: 'released',
    });

    financeDeliveryEvents.emit(
      FINANCE_DELIVERY_EVENT.DELIVERY_FAILED,
      {
        outboxEventId: outbox.id,
        attemptNumber,
        deadLetter,
      }
    );

    error.outboxEventId = outbox.id;
    error.attemptNumber = attemptNumber;
    throw error;
  }
}

module.exports = {
  MAX_ATTEMPTS,
  computeBackoffMs,
  deliverOutboxEvent,
};
