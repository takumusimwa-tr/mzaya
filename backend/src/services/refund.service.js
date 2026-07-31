const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Refund,
  Payment,
  Order,
} = require('../models/associations');
const { validateRefundRequest } = require('./refundPolicy.service');
const { recordRefundAudit } = require('./refundAudit.service');
const { postRefundLedger } = require('./refundLedger.service');
const { disputeEvents, DISPUTE_EVENT } = require('../events/dispute.events');

function serviceError(message, status = 400, code = 'REFUND_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function calculatePreviouslyRefunded(paymentId) {
  const value = await Refund.sum('amount_minor', {
    where: {
      payment_id: paymentId,
      status: { [Op.in]: ['approved', 'processing', 'processed'] },
    },
  });
  return Number(value || 0);
}

async function requestRefund({
  paymentId,
  requesterId,
  amountMinor,
  reason,
  notes,
}) {
  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      throw serviceError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    const order = await Order.findByPk(payment.order_id, { transaction });

    const previouslyRefundedMinor = await calculatePreviouslyRefunded(payment.id);
    const policy = validateRefundRequest({
      paymentStatus: payment.status,
      capturedAmountMinor: payment.amount_minor,
      previouslyRefundedMinor,
      requestedAmountMinor: amountMinor,
    });

    const refund = await Refund.create({
      payment_id: payment.id,
      order_id: payment.order_id,
      customer_id: order.customer_id,
      requested_by: requesterId,
      amount_minor: amountMinor,
      currency: payment.currency,
      reason,
      request_notes: notes || null,
      status: 'requested',
    }, { transaction });

    await recordRefundAudit({
      refundId: refund.id,
      actorId: requesterId,
      action: 'refund_requested',
      newValue: {
        amountMinor,
        reason,
        fullRefund: policy.fullRefund,
      },
      transaction,
    });

    transaction.afterCommit(() => {
      disputeEvents.emit(DISPUTE_EVENT.REFUND_REQUESTED, {
        refundId: refund.id,
        paymentId: payment.id,
        customerId: order.customer_id,
      });
    });

    return refund;
  });
}

async function approveRefund({
  refundId,
  approverId,
  notes,
}) {
  return sequelize.transaction(async (transaction) => {
    const refund = await Refund.findByPk(refundId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!refund) {
      throw serviceError('Refund not found', 404, 'REFUND_NOT_FOUND');
    }

    if (refund.status !== 'requested') {
      throw serviceError('Refund is not awaiting approval', 409, 'INVALID_REFUND_STATUS');
    }

    await refund.update({
      status: 'approved',
      approved_by: approverId,
      approved_at: new Date(),
      decision_notes: notes || null,
    }, { transaction });

    await recordRefundAudit({
      refundId,
      actorId: approverId,
      action: 'refund_approved',
      previousValue: { status: 'requested' },
      newValue: { status: 'approved' },
      transaction,
    });

    return refund;
  });
}

async function completeRefund({
  refundId,
  provider,
  providerReference,
  providerPayload,
  allocations,
  actorId,
}) {
  const refund = await Refund.findByPk(refundId);
  if (!refund) throw serviceError('Refund not found', 404, 'REFUND_NOT_FOUND');
  if (!['approved', 'processing'].includes(refund.status)) {
    throw serviceError('Refund cannot be completed', 409, 'INVALID_REFUND_STATUS');
  }

  const order = await Order.findByPk(refund.order_id);
  await postRefundLedger({
    refund,
    order,
    allocations,
    createdBy: actorId,
  });

  await refund.update({
    status: 'processed',
    provider,
    provider_refund_reference: providerReference,
    provider_payload: providerPayload || {},
    processed_at: new Date(),
  });

  await recordRefundAudit({
    refundId,
    actorId,
    action: 'refund_processed',
    newValue: { providerReference },
  });

  disputeEvents.emit(DISPUTE_EVENT.REFUND_PROCESSED, {
    refundId,
    customerId: refund.customer_id,
  });

  return refund;
}

module.exports = {
  calculatePreviouslyRefunded,
  requestRefund,
  approveRefund,
  completeRefund,
};
