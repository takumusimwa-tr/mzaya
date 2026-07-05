// backend/src/controllers/admin.controller.js
const { Op } = require('sequelize');
const {
  Vendor, User, Order, Rider, City,
} = require('../models/associations');

// GET /api/admin/overview — platform-wide snapshot.
async function overview(req, res) {
  try {
    const [
      totalVendors, pendingVendors, totalRiders, pendingRiders,
      totalCustomers, ordersToday, activeOrders,
    ] = await Promise.all([
      Vendor.count(),
      Vendor.count({ where: { is_active: false } }),
      Rider.count(),
      Rider.count({ where: { is_approved: false } }),
      User.count({ where: { role: 'customer' } }),
      Order.count({ where: { createdAt: { [Op.gte]: startOfToday() } } }),
      Order.count({ where: { status: { [Op.in]: ['pending', 'accepted', 'picked_up', 'en_route'] } } }),
    ]);

    // Revenue today (delivered orders).
    const deliveredToday = await Order.findAll({
      where: { status: 'delivered', delivered_at: { [Op.gte]: startOfToday() } },
      attributes: ['total_usd'],
      raw: true,
    });
    const revenueToday = deliveredToday.reduce((s, o) => s + Number(o.total_usd || 0), 0);

    return res.status(200).json({
      overview: {
        total_vendors:    totalVendors,
        pending_vendors:  pendingVendors,
        total_riders:     totalRiders,
        pending_riders:   pendingRiders,
        total_customers:  totalCustomers,
        orders_today:     ordersToday,
        active_orders:    activeOrders,
        revenue_today:    parseFloat(revenueToday.toFixed(2)),
      },
    });
  } catch (err) {
    console.error('admin overview error:', err.message);
    return res.status(500).json({ error: 'Failed to load overview' });
  }
}

// GET /api/admin/vendors?status=pending|active|all
async function listVendors(req, res) {
  try {
    const status = req.query.status || 'all';
    const where = {};
    if (status === 'pending') where.is_active = false;
    if (status === 'active')  where.is_active = true;

    const vendors = await Vendor.findAll({
      where,
      include: [
        { model: City, as: 'city', required: false },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone'], required: false },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ vendors });
  } catch (err) {
    console.error('admin listVendors error:', err.message);
    return res.status(500).json({ error: 'Failed to load vendors' });
  }
}

// PATCH /api/admin/vendors/:id/approve
async function approveVendor(req, res) {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    await vendor.update({ is_active: true });
    return res.status(200).json({ message: 'Vendor approved', vendor });
  } catch (err) {
    console.error('approveVendor error:', err.message);
    return res.status(500).json({ error: 'Failed to approve vendor' });
  }
}

// PATCH /api/admin/vendors/:id/reject  (sets inactive; kept, not deleted)
async function rejectVendor(req, res) {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    await vendor.update({ is_active: false });
    return res.status(200).json({ message: 'Vendor set inactive', vendor });
  } catch (err) {
    console.error('rejectVendor error:', err.message);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
}

// GET /api/admin/riders?status=pending|approved|all
async function listRiders(req, res) {
  try {
    const status = req.query.status || 'all';
    const where = {};
    if (status === 'pending')  where.is_approved = false;
    if (status === 'approved') where.is_approved = true;

    const riders = await Rider.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'phone'], required: false },
        { model: City, as: 'city', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ riders });
  } catch (err) {
    console.error('admin listRiders error:', err.message);
    return res.status(500).json({ error: 'Failed to load riders' });
  }
}

// PATCH /api/admin/riders/:id/approve
async function approveRider(req, res) {
  try {
    const rider = await Rider.findByPk(req.params.id);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    await rider.update({ is_approved: true });
    return res.status(200).json({ message: 'Rider approved', rider });
  } catch (err) {
    console.error('approveRider error:', err.message);
    return res.status(500).json({ error: 'Failed to approve rider' });
  }
}

// GET /api/admin/orders/live — currently active orders across the platform.
async function liveOrders(req, res) {
  try {
    const orders = await Order.findAll({
      where: { status: { [Op.in]: ['pending', 'accepted', 'picked_up', 'en_route'] } },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('liveOrders error:', err.message);
    return res.status(500).json({ error: 'Failed to load live orders' });
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = {
  overview, listVendors, approveVendor, rejectVendor,
  listRiders, approveRider, liveOrders,
};
