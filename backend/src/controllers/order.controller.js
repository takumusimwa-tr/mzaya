const {
  createOrder,
  quoteOrder,
  getOrderById,
  getCustomerOrders,
  getRiderOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../services/order.service');
const { VEHICLE_RANK } = require('../config/constants');

// Default an unknown/missing vehicle to bicycle-level capability (rank 1) so a
// rider with a bad record still sees the lightest orders but nothing gated.
function riderRankOf(vehicle) {
  return VEHICLE_RANK[vehicle] || VEHICLE_RANK.bicycle;
}
function orderRankOf(vehicle) {
  return VEHICLE_RANK[vehicle] || VEHICLE_RANK.bicycle;
}

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

// POST /api/orders/quote — compute fee + required vehicle without placing.
// Uses the same logic as placement so the quote matches the final charge.
async function quote(req, res) {
  try {
    const result = quoteOrder(req.body);
    return res.status(200).json({ quote: result });
  } catch (err) {
    console.error('quote error:', err.message);
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

// GET /api/orders/available — unassigned pending orders a rider may claim.
// Returns only orders whose required vehicle class this rider's vehicle can
// handle (a sedan rider never sees a 5-tonne materials order).
async function availableOrders(req, res) {
  try {
    const { Order, Rider, City, OrderFood, OrderGrocery, OrderMaterials, OrderErrand } =
      require('../models/associations');
    const { Op } = require('sequelize');

    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });

    const riderRank = riderRankOf(rider.vehicle_type);

    // Resolve the rider's city → lowercase slug used on orders.city
    let cityName = null;
    try {
      if (rider.city_id && City) {
        const city = await City.findByPk(rider.city_id);
        if (city) cityName = city.name.toLowerCase();
      }
    } catch (e) {
      cityName = null;
    }

    const where = { status: 'pending', rider_id: { [Op.is]: null } };
    if (cityName) where.city = cityName;

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderFood,      as: 'foodDetail',      required: false },
        { model: OrderGrocery,   as: 'groceryDetail',   required: false },
        { model: OrderMaterials, as: 'materialsDetail', required: false },
        { model: OrderErrand,    as: 'errandDetail',    required: false },
      ],
      order: [['createdAt', 'ASC']],
      limit: 40, // over-fetch; vehicle filter trims below
    });

    const visible = orders
      .filter((o) => orderRankOf(o.vehicle_type) <= riderRank)
      .slice(0, 20);

    return res.status(200).json({ orders: visible });
  } catch (err) {
    console.error('availableOrders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch available orders' });
  }
}

// POST /api/orders/:id/claim — rider claims an order. Re-checks vehicle class
// server-side so a stale board or crafted request can't let an under-capacity
// rider take a heavy order.
async function claimOrder(req, res) {
  try {
    const { Order, Rider } = require('../models/associations');

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.rider_id) {
      return res.status(409).json({ error: 'This order was already taken by another rider' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'This order is no longer available' });
    }

    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });

    if (riderRankOf(rider.vehicle_type) < orderRankOf(order.vehicle_type)) {
      return res.status(403).json({
        error: 'This order needs a larger vehicle than your registered one',
      });
    }

    // rider_id references users(id)
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
    const { Order, OrderFood, OrderGrocery, OrderMaterials, OrderErrand, Vendor } =
      require('../models/associations');
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
  placeOrder, quote, getOrder, myOrders, availableOrders, claimOrder,
  updateStatus, cancel, vendorOrders, rateOrder,
};
