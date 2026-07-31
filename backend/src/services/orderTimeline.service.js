const OrderTimeline = require('../models/orderTimelineModel');

async function recordTimelineEvent({ orderId, fromStatus, toStatus, actorId, actorRole, note, metadata }, options = {}) {
  return OrderTimeline.create({
    order_id: orderId,
    from_status: fromStatus || null,
    to_status: toStatus,
    actor_id: actorId || null,
    actor_role: actorRole || null,
    note: note || null,
    metadata: metadata || {},
  }, options);
}

async function getOrderTimeline(orderId) {
  return OrderTimeline.findAll({
    where: { order_id: orderId },
    order: [['createdAt', 'ASC']],
  });
}

module.exports = { recordTimelineEvent, getOrderTimeline };
