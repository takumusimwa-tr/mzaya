/**
 * Batch 08.5.1 integration example.
 *
 * IMPORTANT:
 * Merge this pattern into the existing paymentService.js rather than replacing
 * provider logic. The payment state mutation and outbox event MUST share the
 * same Sequelize transaction.
 */
const { sequelize } = require('../config/db');
const { Payment } = require('../models/associations');
const {
  emitPaymentCaptured,
  emitPaymentFailed,
} = require('./paymentFinanceEvents.service');

async function markPaymentCapturedWithFinance({
  paymentId,
  providerReference,
}) {
  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      const error = new Error('Payment not found');
      error.status = 404;
      throw error;
    }

    if (payment.status === 'captured') return payment;

    await payment.update({
      status: 'captured',
      provider_reference: providerReference,
    }, { transaction });

    await emitPaymentCaptured({
      payment,
      transaction,
    });

    return payment;
  });
}

async function markPaymentFailedWithFinance({
  paymentId,
  reason,
}) {
  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      const error = new Error('Payment not found');
      error.status = 404;
      throw error;
    }

    await payment.update({
      status: 'failed',
      failure_reason: reason,
    }, { transaction });

    await emitPaymentFailed({
      payment,
      transaction,
      reason,
    });

    return payment;
  });
}

module.exports = {
  markPaymentCapturedWithFinance,
  markPaymentFailedWithFinance,
};
