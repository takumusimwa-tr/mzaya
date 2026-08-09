const crypto = require('crypto');
const {
  FinanceBusinessEvent,
} = require('../models/associations');

function stablePayloadHash(payload) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payload || {}))
    .digest('hex');
}

async function findExistingEvent(idempotencyKey) {
  return FinanceBusinessEvent.findOne({
    where: { idempotency_key: idempotencyKey },
  });
}

async function assertIdempotentPayload({
  idempotencyKey,
  payload,
}) {
  const existing = await findExistingEvent(idempotencyKey);
  if (!existing) return null;

  const incomingHash = stablePayloadHash(payload);
  if (incomingHash !== existing.payload_hash) {
    const error = new Error('Idempotency key was reused with a different payload');
    error.status = 409;
    error.code = 'FINANCE_EVENT_IDEMPOTENCY_CONFLICT';
    throw error;
  }

  return existing;
}

module.exports = {
  stablePayloadHash,
  findExistingEvent,
  assertIdempotentPayload,
};
