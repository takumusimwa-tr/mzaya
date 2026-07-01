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

// GET /api/orders/available — unassigned pending orders for riders to claim
async function availableOrders(req, res) {
  try {
    const { Order, Rider, City, OrderFood, OrderGrocery, OrderMaterials, OrderErrand } = require('../models/associations');
    const { Op } = require('sequelize');

    // Find the rider's city (to match against the order's city string)
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });

    // Resolve the rider's city name (lowercase slug) from the cities table
    let cityName = null;
    try {
      if (rider.city_id && City) {
        const city = await City.findByPk(rider.city_id);
        if (city) cityName = city.name.toLowerCase();
      }
    } catch (e) {
      // City model not available — skip city filtering
      cityName = null;
    }

    // Build where clause — pending, unassigned. Filter by city if known.
    const where = {
      status:   'pending',
      rider_id: { [Op.is]: null },
    };
    if (cityName) {
      where.city = cityName;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderFood,      as: 'foodDetail',      required: false },
        { model: OrderGrocery,   as: 'groceryDetail',   required: false },
        { model: OrderMaterials, as: 'materialsDetail', required: false },
        { model: OrderErrand,    as: 'errandDetail',    required: false },
      ],
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error('availableOrders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch available orders' });
  }
}

// POST /api/orders/:id/claim — rider claims an available order
async function claimOrder(req, res) {
  try {
    const { Order } = require('../models/associations');

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Prevent double-claiming
    if (order.rider_id) {
      return res.status(409).json({ error: 'This order was already taken by another rider' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'This order is no longer available' });
    }

    // rider_id references users(id), so store the rider's user id
    await order.update({ rider_id: req.user.id, status: 'accepted', accepted_at: new Date() });
    return res.status(200).json({ message: 'Order claimed', order });
  } catch (err) {
    console.error('claimOrder error:', err.message);
    return res.status(500).json({ error: 'Failed to claim order' });
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

// GET /api/orders/vendor
async function vendorOrders(req, res) {
  try {
    const { Order, OrderFood, OrderGrocery, OrderMaterials, OrderErrand, Vendor } = require('../models/associations');
    const { Op } = require('sequelize');

    const vendor = await Vendor.findOne({ where: { owner_id: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const [foodOrders, groceryOrders, materialOrders] = await Promise.all([
      OrderFood.findAll({ where: { restaurant_id: vendor.id } }),
      OrderGrocery.findAll({ where: { store_id: vendor.id } }),
      OrderMaterials.findAll({ where: { supplier_id: vendor.id } }),
    ]);

    const orderIds = [
      ...foodOrders.map((o) => o.order_id),
      ...groceryOrders.map((o) => o.order_id),
      ...materialOrders.map((o) => o.order_id),
    ];

    if (!orderIds.length) return res.status(200).json({ orders: [] });

    const orders = await Order.findAll({
      where: { id: { [Op.in]: orderIds } },
      include: [
        { model: OrderFood,      as: 'foodDetail',      required: false },
        { model: OrderGrocery,   as: 'groceryDetail',   required: false },
        { model: OrderMaterials, as: 'materialsDetail', required: false },
        { model: OrderErrand,    as: 'errandDetail',    required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error('vendorOrders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch vendor orders' });
  }
}

// POST /api/orders/:id/rate
async function rateOrder(req, res) {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const { Order } = require('../models/associations');
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Can only rate delivered orders' });
    await order.update({ rating, review: review || null });
    return res.status(200).json({ message: 'Rating submitted', rating });
  } catch (err) {
    console.error('rateOrder error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  placeOrder, getOrder, myOrders, availableOrders, claimOrder,
  updateStatus, cancel, vendorOrders, rateOrder,
};
