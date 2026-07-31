const { sequelize } = require('../config/db');
const { Order } = require('../models/associations');
const { assertTransitionAllowed, transitionTimestampPatch } = require('./orderStateMachine.service');
const { recordTimelineEvent } = require('./orderTimeline.service');
const { emitOrderStatusChanged } = require('../events/order.events');

async function transitionOrder({ orderId, toStatus, actorId, actorRole, note, metadata = {}, deliveryProofUrl }) {
  const result = await sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    const fromStatus = order.status;
    assertTransitionAllowed({ from: fromStatus, to: toStatus, role: actorRole });

    if (toStatus === 'delivered' && !deliveryProofUrl) {
      const error = new Error('A delivery proof photo is required');
      error.status = 400;
      throw error;
    }

    const at = new Date();
    const patch = {
      status: toStatus,
      ...transitionTimestampPatch(toStatus, at),
    };
    if (deliveryProofUrl) patch.delivery_proof_url = deliveryProofUrl;
    if (toStatus === 'cancelled' && note) patch.cancel_reason = note;

    await order.update(patch, { transaction });
    await recordTimelineEvent({
      orderId: order.id,
      fromStatus,
      toStatus,
      actorId,
      actorRole,
      note,
      metadata,
    }, { transaction });

    return { order, fromStatus, toStatus, changedAt: at };
  });

  emitOrderStatusChanged({
    orderId: result.order.id,
    fromStatus: result.fromStatus,
    toStatus: result.toStatus,
    actorId,
    actorRole,
    changedAt: result.changedAt,
  });

  return result.order;
}

module.exports = { transitionOrder };
