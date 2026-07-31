const crypto = require('crypto');
const stableStringify = require('json-stable-stringify');
const {
  PaymentIdempotencyKey,
} = require('../models/associations');

function hashRequest(value) {
  return crypto
    .createHash('sha256')
    .update(stableStringify(value || {}))
    .digest('hex');
}

/**
 * Executes a payment mutation exactly once for one idempotency key.
 * A repeated request with a different payload is rejected.
 */
async function executeIdempotent({
  key,
  operation,
  request,
  ttlHours = 24,
  execute,
}) {
  const requestHash = hashRequest(request);

  const [record, created] = await PaymentIdempotencyKey.findOrCreate({
    where: { idempotency_key: key },
    defaults: {
      operation,
      request_hash: requestHash,
      locked_at: new Date(),
      expires_at: new Date(Date.now() + ttlHours * 60 * 60 * 1000),
    },
  });

  if (!created) {
    if (record.operation !== operation || record.request_hash !== requestHash) {
      const error = new Error(
        'Idempotency key was already used with a different request'
      );
      error.status = 409;
      error.code = 'IDEMPOTENCY_CONFLICT';
      throw error;
    }

    if (record.response_status) {
      return {
        replayed: true,
        status: record.response_status,
        body: record.response_body,
      };
    }

    const error = new Error('This payment operation is already processing');
    error.status = 409;
    error.code = 'IDEMPOTENCY_IN_PROGRESS';
    throw error;
  }

  try {
    const result = await execute();

    await record.update({
      response_status: result.status,
      response_body: result.body,
      resource_type: result.resourceType || null,
      resource_id: result.resourceId || null,
      locked_at: null,
    });

    return {
      replayed: false,
      ...result,
    };
  } catch (error) {
    await record.destroy();
    throw error;
  }
}

module.exports = {
  hashRequest,
  executeIdempotent,
};
