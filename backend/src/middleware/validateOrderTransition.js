const { assertTransitionAllowed, OrderTransitionError } = require('../services/orderStateMachine.service');

function validateOrderTransition(req, res, next) {
  try {
    const order = req.order;
    if (!order) return res.status(500).json({ error: 'Order middleware context is missing' });

    assertTransitionAllowed({
      from: order.status,
      to: req.body.status,
      role: req.user?.role,
    });
    return next();
  } catch (error) {
    if (error instanceof OrderTransitionError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    return next(error);
  }
}

module.exports = { validateOrderTransition };
