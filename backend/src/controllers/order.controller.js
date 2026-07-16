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
const { logger } = require('../utils/logger');

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
    logger.error('placeorder_error', { error: err.message });
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
    logger.error('quote_error', { error: err.message });
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
    logger.error('availableorders_error', { error: err.message });
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

    // Atomic claim: only succeeds if the order is STILL unclaimed. Without the
    // rider_id: null guard in the WHERE clause, two riders tapping Accept at the
    // same moment can both pass the check above and both write — one silently
    // stealing the other's order. The DB decides the winner, not the race.
    const [updatedCount] = await Order.update(
      { rider_id: req.user.id, status: 'accepted', accepted_at: new Date() },
      { where: { id: order.id, rider_id: null, status: 'pending' } },
    );

    if (updatedCount === 0) {
      return res.status(409).json({ error: 'This order was already taken by another rider' });
    }

    const claimed = await Order.findByPk(order.id);
    return res.status(200).json({ message: 'Order claimed', order: claimed });
  } catch (err) {
    logger.error('claimorder_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to claim order' });
  }
}

// POST /api/orders/:id/upgrade-vehicle  { vehicle_type }
// Vendor flags that an order needs a bigger vehicle than assigned (e.g. bulky
// materials). Bumps the order's vehicle tier, recomputes the fee, and if the
// current rider's vehicle can no longer handle it, releases it back to dispatch.
async function upgradeVehicle(req, res) {
  try {
    const { Order, Vendor, OrderFood, OrderGrocery, OrderMaterials } = require('../models/associations');
    const { VEHICLE_RANK, VEHICLE_META, ORDER_STATUS } = require('../config/constants');
    const { calculateFees, convertToZig } = require('../utils/feeCalculator');
    const { feeTierFor, calculateDistanceKm, rankOf } = require('../services/dispatch.service');
    const { getCurrentRate } = require('../services/currency.service');

    const { vehicle_type } = req.body;
    if (!vehicle_type || !VEHICLE_RANK[vehicle_type]) {
      return res.status(400).json({ error: 'A valid vehicle type is required' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Authorize: the requesting vendor must own this order.
    const vendor = await Vendor.findOne({ where: { owner_id: req.user.id } });
    if (!vendor) return res.status(403).json({ error: 'Not a vendor' });
    const owns = await OrderFood.findOne({ where: { order_id: order.id, restaurant_id: vendor.id } })
      || await OrderGrocery.findOne({ where: { order_id: order.id, store_id: vendor.id } })
      || await OrderMaterials.findOne({ where: { order_id: order.id, supplier_id: vendor.id } });
    if (!owns) return res.status(403).json({ error: 'This order does not belong to your store' });

    // Can only upgrade before pickup.
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED].includes(order.status)) {
      return res.status(400).json({ error: 'This order can no longer be upgraded (already picked up)' });
    }

    // Must be an actual upgrade (higher rank than current).
    if (rankOf(vehicle_type) <= rankOf(order.vehicle_type)) {
      return res.status(400).json({ error: 'Choose a larger vehicle than the current one' });
    }

    // Recompute the delivery fee for the bigger vehicle.
    const distanceKm = calculateDistanceKm(order.pickup_location, order.dropoff_location);
    const weightKg   = Number(owns.total_weight_kg || 0);
    const fees = calculateFees({
      categoryType: order.category_type,
      vehicleType:  feeTierFor(vehicle_type),
      distanceKm,
      subtotalUsd:  Number(order.subtotal_usd || 0),
      weightKg,
    });

    const zigRate = getCurrentRate();
    // Preserve tip + discount that were on the order.
    const tip = Number(order.tip_usd || 0);
    const discount = Number(order.discount_usd || 0);
    const newTotal = parseFloat(Math.max(0, fees.total_usd + tip - discount).toFixed(2));

    // If a rider is assigned but their vehicle can't handle the new class, release it.
    let released = false;
    if (order.rider_id) {
      const { Rider } = require('../models/associations');
      const rider = await Rider.findOne({ where: { user_id: order.rider_id } });
      if (!rider || rankOf(rider.vehicle_type) < rankOf(vehicle_type)) {
        released = true;
      }
    }

    await order.update({
      vehicle_type,
      delivery_fee_usd: fees.delivery_fee_usd,
      total_usd:        newTotal,
      total_zig:        zigRate ? convertToZig(newTotal, zigRate) : order.total_zig,
      ...(released ? { rider_id: null, status: ORDER_STATUS.PENDING, accepted_at: null } : {}),
    });

    return res.status(200).json({
      message: released
        ? `Upgraded to ${VEHICLE_META[vehicle_type]?.name}. Reassigning to a suitable rider.`
        : `Upgraded to ${VEHICLE_META[vehicle_type]?.name}.`,
      vehicle_type,
      delivery_fee_usd: fees.delivery_fee_usd,
      total_usd: newTotal,
      released,
    });
  } catch (err) {
    logger.error('upgradevehicle_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to upgrade vehicle' });
  }
}

// PATCH /api/orders/:id/status
async function updateStatus(req, res) {
  try {
    const { status, delivery_proof_url } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    // Require a proof photo to mark an order delivered.
    if (status === 'delivered' && !delivery_proof_url) {
      return res.status(400).json({ error: 'A delivery proof photo is required' });
    }

    const order = await updateOrderStatus(req.params.id, status, req.user.id);

    // Persist the proof photo on the order.
    if (status === 'delivered' && delivery_proof_url) {
      await order.update({ delivery_proof_url });
    }

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

    const vendor = await Vendor.findOne({
      where: {
        owner_id: req.user.id,
        ...(req.query.branch_id ? { id: req.query.branch_id } : {}),
      },
      order: [['createdAt', 'ASC']],
    });
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
    logger.error('vendororders_error', { error: err.message });
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
    logger.error('rateorder_error', { error: err.message });
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  placeOrder, quote, getOrder, myOrders, availableOrders, claimOrder,
  updateStatus, cancel, vendorOrders, rateOrder, upgradeVehicle,
};
