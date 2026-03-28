const {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getRiderOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../services/order.service');

// POST /api/orders
async function placeOrder(req, res) {
  try {
    const result = await createOrder(req.user.id, req.body);
    return res.status(201).json({
      message:  'Order placed successfully',
      order:    result.order,
      dispatch: result.dispatch,
    });
  } catch (err) {
    console.error('placeOrder error:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

// GET /api/orders/:id
async function getOrder(req, res) {
  try {
    const order = await getOrderById(req.params.id, req.user.id, req.user.role);
    return res.status(200).json({ order });
  } catch (err) {
    const status = err.message === 'Order not found' ? 404
      : err.message === 'Access denied' ? 403 : 500;
    return res.status(status).json({ error: err.message });
  }
}

// GET /api/orders/my
async function myOrders(req, res) {
  try {
    const orders = req.user.role === 'rider'
      ? await getRiderOrders(req.user.id)
      : await getCustomerOrders(req.user.id);
    return res.status(200).json({ orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PATCH /api/orders/:id/status
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const order = await updateOrderStatus(req.params.id, status, req.user.id);
    return res.status(200).json({ message: 'Status updated', order });
  } catch (err) {
    const code = err.message === 'Access denied' ? 403 : 400;
    return res.status(code).json({ error: err.message });
  }
}

// POST /api/orders/:id/cancel
async function cancel(req, res) {
  try {
    const order = await cancelOrder(req.params.id, req.user.id, req.body.reason);
    return res.status(200).json({ message: 'Order cancelled', order });
  } catch (err) {
    const code = err.message === 'Access denied' ? 403 : 400;
    return res.status(code).json({ error: err.message });
  }
}

module.exports = { placeOrder, getOrder, myOrders, updateStatus, cancel };