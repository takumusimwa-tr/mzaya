const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  Payment,
  PaymentRefund,
} = require('../models/associations');
const {
  emitRefundRequested,
  emitRefundCompleted,
} = require('./refundFinanceEvents.service');

async function refundableBalanceMinor(paymentId, transaction = null) {
  const payment = await Payment.findByPk(paymentId, { transaction });
  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }

  const refunds = await PaymentRefund.sum('amount_minor', {
    where: {
      payment_id: paymentId,
      status: ['requested', 'processing', 'completed'],
    },
    transaction,
  });

  const captured = Number(payment.amount_minor ?? payment.amount ?? 0);
  return Math.max(0, captured - Number(refunds || 0));
}

async function requestRefund({
  paymentId,
  amountMinor,
  reason = null,
  requestedBy,
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

    const available = await refundableBalanceMinor(paymentId, transaction);

    if (Number(amountMinor) <= 0 || Number(amountMinor) > available) {
      const error = new Error('Refund exceeds refundable payment balance');
      error.status = 409;
      error.code = 'REFUND_EXCEEDS_CAPTURED_AMOUNT';
      throw error;
    }

    const refund = await PaymentRefund.create({
      payment_id: payment.id,
      refund_reference:
        `RFD-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      currency: payment.currency,
      amount_minor: amountMinor,
      reason,
      requested_by: requestedBy,
      status: 'requested',
    }, { transaction });

    await emitRefundRequested({
      payment,
      refund,
      transaction,
    });

    return refund;
  });
}

async function markRefundCompleted({
  refundId,
  providerRefundReference = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const refund = await PaymentRefund.findByPk(refundId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!refund) {
      const error = new Error('Refund not found');
      error.status = 404;
      throw error;
    }

    if (refund.status === 'completed') return refund;

    const payment = await Payment.findByPk(refund.payment_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    await refund.update({
      status: 'completed',
      provider_refund_reference: providerRefundReference,
      completed_at: new Date(),
    }, { transaction });

    await emitRefundCompleted({
      payment,
      refund,
      transaction,
    });

    return refund;
  });
}

module.exports = {
  refundableBalanceMinor,
  requestRefund,
  markRefundCompleted,
};
