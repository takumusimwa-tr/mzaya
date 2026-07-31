const { transitionOrder } = require('../services/orderTransition.service');
const { getOrderTimeline } = require('../services/orderTimeline.service');
const { availableTransitions } = require('../services/orderStateMachine.service');

async function transition(req, res, next) {
  try {
    const order = await transitionOrder({
      orderId: req.params.id,
      toStatus: req.body.status,
      actorId: req.user.id,
      actorRole: req.user.role,
      note: req.body.note,
      metadata: req.body.metadata,
      deliveryProofUrl: req.body.delivery_proof_url,
    });
    return res.status(200).json({
      message: 'Order status updated',
      order,
      available_transitions: availableTransitions(order.status),
    });
  } catch (error) {
    return next(error);
  }
}

async function timeline(req, res, next) {
  try {
    const events = await getOrderTimeline(req.params.id);
    return res.status(200).json({ order_id: req.params.id, timeline: events });
  } catch (error) {
    return next(error);
  }
}

module.exports = { transition, timeline };
