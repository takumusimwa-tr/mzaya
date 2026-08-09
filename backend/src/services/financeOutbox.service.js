const crypto = require('crypto');
const {
  FinanceOutboxEvent,
} = require('../models/associations');

function stablePayloadHash(payload) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payload || {}))
    .digest('hex');
}

async function enqueueFinanceOutboxEvent({
  transaction,
  aggregateType,
  aggregateId = null,
  eventType,
  eventKey = null,
  sourceSystem,
  payload,
  idempotencyKey,
  availableAt = new Date(),
  metadata = {},
}) {
  if (!transaction) {
    const error = new Error('Transactional outbox write requires an existing DB transaction');
    error.code = 'OUTBOX_TRANSACTION_REQUIRED';
    throw error;
  }

  const existing = await FinanceOutboxEvent.findOne({
    where: { idempotency_key: idempotencyKey },
    transaction,
  });

  const payloadHash = stablePayloadHash(payload);

  if (existing) {
    if (existing.payload_hash !== payloadHash) {
      const error = new Error('Outbox idempotency key reused with a different payload');
      error.status = 409;
      error.code = 'OUTBOX_IDEMPOTENCY_CONFLICT';
      throw error;
    }
    return existing;
  }

  return FinanceOutboxEvent.create({
    aggregate_type: aggregateType,
    aggregate_id: aggregateId,
    event_type: eventType,
    event_key:
      eventKey ||
      `OUT-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    source_system: sourceSystem,
    payload,
    payload_hash: payloadHash,
    idempotency_key: idempotencyKey,
    available_at: availableAt,
    status: 'pending',
    metadata,
  }, { transaction });
}

module.exports = {
  stablePayloadHash,
  enqueueFinanceOutboxEvent,
};
