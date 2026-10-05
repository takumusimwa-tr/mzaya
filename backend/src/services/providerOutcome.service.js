const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  PaymentAttempt,
  ProviderCallbackReceipt,
} = require('../models/associations');
const {
  emitPaymentCaptured,
  emitPaymentFailed,
} = require('./paymentFinanceEvents.service');

function normalizeProviderOutcome(rawStatus) {
  const value = String(rawStatus || '').trim().toLowerCase();

  if (['paid', 'success', 'successful', 'completed', 'captured'].includes(value)) {
    return 'success';
  }

  if (['failed', 'failure', 'cancelled', 'canceled', 'declined', 'expired'].includes(value)) {
    return 'failed';
  }

  return 'pending';
}

function callbackKey({
  provider,
  providerReference = null,
  paymentId,
  rawStatus,
  payload = {},
}) {
  const stablePayload = JSON.stringify(payload, Object.keys(payload).sort());
  const hash = crypto
    .createHash('sha256')
    .update([
      provider,
      providerReference || '',
      paymentId || '',
      rawStatus || '',
      stablePayload,
    ].join('|'))
    .digest('hex');

  return `${provider}:${hash}`;
}

async function applyProviderOutcome({
  provider,
  paymentId,
  providerReference = null,
  rawStatus,
  payload = {},
}) {
  const normalized = normalizeProviderOutcome(rawStatus);
  const key = callbackKey({
    provider,
    providerReference,
    paymentId,
    rawStatus,
    payload,
  });

  return sequelize.transaction(async (transaction) => {
    const [receipt, created] =
      await ProviderCallbackReceipt.findOrCreate({
        where: { callback_key: key },
        defaults: {
          provider,
          callback_key: key,
          payment_id: paymentId,
          outcome: normalized,
          raw_status: rawStatus || null,
          metadata: {
            providerReference,
          },
        },
        transaction,
      });

    if (!created && receipt.processed_at) {
      return {
        receipt,
        duplicate: true,
        payment: paymentId
          ? await PaymentAttempt.findByPk(paymentId, { transaction })
          : null,
      };
    }

    const payment = await PaymentAttempt.findByPk(paymentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      const error = new Error('Payment attempt not found');
      error.status = 404;
      error.code = 'PAYMENT_ATTEMPT_NOT_FOUND';
      throw error;
    }

    const current = String(payment.status || '').toLowerCase();

    // Terminal success wins over later duplicate/contradictory provider noise.
    // A terminal failure cannot be promoted without a fresh provider success.
    let next = current;

    if (normalized === 'success') {
      next = 'success';
    } else if (
      normalized === 'failed' &&
      current !== 'success'
    ) {
      next = 'failed';
    } else if (
      normalized === 'pending' &&
      !['success', 'failed'].includes(current)
    ) {
      next = 'pending';
    }

    const transitioned = next !== current;

    if (transitioned) {
      await payment.update({
        status: next,
        provider_reference:
          providerReference || payment.provider_reference,
        provider_payload: payload,
        resolved_at:
          ['success', 'failed'].includes(next)
            ? new Date()
            : payment.resolved_at,
      }, { transaction });

      if (next === 'success') {
        await emitPaymentCaptured({
          payment,
          transaction,
        });
      } else if (next === 'failed') {
        await emitPaymentFailed({
          payment,
          transaction,
          reason: rawStatus || 'provider_reported_failure',
        });
      }
    }

    await receipt.update({
      processed_at: new Date(),
      outcome: normalized,
    }, { transaction });

    return {
      receipt,
      duplicate: !created,
      transitioned,
      payment,
    };
  });
}

module.exports = {
  normalizeProviderOutcome,
  callbackKey,
  applyProviderOutcome,
};
