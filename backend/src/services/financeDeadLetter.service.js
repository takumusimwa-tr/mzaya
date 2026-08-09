const crypto = require('crypto');
const {
  FinanceDeadLetter,
  FinanceOutboxEvent,
} = require('../models/associations');
const {
  financeDeliveryEvents,
  FINANCE_DELIVERY_EVENT,
} = require('../events/financeDelivery.events');

async function quarantineOutboxEvent({
  outboxEventId,
  reasonCode,
  reason,
}) {
  const outbox = await FinanceOutboxEvent.findByPk(outboxEventId);
  if (!outbox) {
    const error = new Error('Outbox event not found');
    error.status = 404;
    throw error;
  }

  const [deadLetter] = await FinanceDeadLetter.findOrCreate({
    where: {
      outbox_event_id: outbox.id,
      status: 'quarantined',
    },
    defaults: {
      dead_letter_reference:
        `FDL-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      reason_code: reasonCode,
      reason,
      attempt_count: Number(outbox.attempt_count || 0),
      first_failed_at: outbox.updated_at,
    },
  });

  await outbox.update({ status: 'dead_letter' });

  financeDeliveryEvents.emit(
    FINANCE_DELIVERY_EVENT.DEAD_LETTER_CREATED,
    {
      deadLetterId: deadLetter.id,
      outboxEventId: outbox.id,
    }
  );

  return deadLetter;
}

async function requestDeadLetterReplay({
  deadLetterId,
  requestedBy,
}) {
  const deadLetter = await FinanceDeadLetter.findByPk(deadLetterId);
  if (!deadLetter) {
    const error = new Error('Dead-letter item not found');
    error.status = 404;
    throw error;
  }

  const outbox = await FinanceOutboxEvent.findByPk(deadLetter.outbox_event_id);

  await outbox.update({
    status: 'retry',
    available_at: new Date(),
    last_error: null,
  });

  await deadLetter.update({
    status: 'replay_requested',
    replay_requested_by: requestedBy,
    replay_requested_at: new Date(),
  });

  financeDeliveryEvents.emit(
    FINANCE_DELIVERY_EVENT.DEAD_LETTER_REPLAYED,
    {
      deadLetterId: deadLetter.id,
      outboxEventId: outbox.id,
    }
  );

  return deadLetter;
}

module.exports = {
  quarantineOutboxEvent,
  requestDeadLetterReplay,
};
