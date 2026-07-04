// backend/src/controllers/vendorStats.controller.js
const { Op } = require('sequelize');
const {
  Order, OrderFood, OrderGrocery, OrderMaterials, Vendor,
} = require('../models/associations');

// Resolve the vendor's order IDs across all category detail tables.
async function vendorOrderIds(vendorId) {
  const [food, grocery, materials] = await Promise.all([
    OrderFood.findAll({ where: { restaurant_id: vendorId }, attributes: ['order_id'], raw: true }),
    OrderGrocery.findAll({ where: { store_id: vendorId }, attributes: ['order_id'], raw: true }),
    OrderMaterials.findAll({ where: { supplier_id: vendorId }, attributes: ['order_id'], raw: true }),
  ]);
  return [...food, ...grocery, ...materials].map((r) => r.order_id);
}

// GET /api/vendor-stats?range=week|month
async function vendorStats(req, res) {
  try {
    const vendor = await Vendor.findOne({ where: { owner_id: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const range = req.query.range === 'month' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - (range - 1));
    since.setHours(0, 0, 0, 0);

    const orderIds = await vendorOrderIds(vendor.id);
    if (!orderIds.length) {
      return res.status(200).json({ stats: emptyStats(range) });
    }

    const orders = await Order.findAll({
      where: {
        id: { [Op.in]: orderIds },
        createdAt: { [Op.gte]: since },
      },
      include: [
        { model: OrderFood,      as: 'foodDetail',      required: false },
        { model: OrderGrocery,   as: 'groceryDetail',   required: false },
        { model: OrderMaterials, as: 'materialsDetail', required: false },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Only delivered orders count toward revenue; all count toward volume.
    const delivered = orders.filter((o) => o.status === 'delivered');

    // Revenue = subtotal of delivered orders (what the vendor actually earned on goods).
    const revenue = delivered.reduce((s, o) => s + Number(o.subtotal_usd || 0), 0);
    const avgOrder = delivered.length ? revenue / delivered.length : 0;

    // Daily series (revenue + order count) over the window.
    const days = []
    for (let i = 0; i < range; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      days.push({ date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 })
    }
    const dayIndex = new Map(days.map((d, i) => [d.date, i]))
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      const idx = dayIndex.get(key)
      if (idx == null) continue
      days[idx].orders += 1
      if (o.status === 'delivered') days[idx].revenue += Number(o.subtotal_usd || 0)
    }

    // Top items by quantity across delivered orders.
    const itemMap = new Map()
    for (const o of delivered) {
      const detail = o.foodDetail || o.groceryDetail || o.materialsDetail
      for (const it of detail?.items || []) {
        const key = it.name || 'Item'
        const cur = itemMap.get(key) || { name: key, qty: 0, revenue: 0 }
        cur.qty += Number(it.qty || 1)
        cur.revenue += Number(it.unit_price_usd || 0) * Number(it.qty || 1)
        itemMap.set(key, cur)
      }
    }
    const topItems = [...itemMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)

    // Status breakdown for the window.
    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    return res.status(200).json({
      stats: {
        range_days:      range,
        total_orders:    orders.length,
        delivered_orders: delivered.length,
        revenue_usd:     parseFloat(revenue.toFixed(2)),
        avg_order_usd:   parseFloat(avgOrder.toFixed(2)),
        daily:           days.map((d) => ({ ...d, revenue: parseFloat(d.revenue.toFixed(2)) })),
        top_items:       topItems.map((t) => ({ ...t, revenue: parseFloat(t.revenue.toFixed(2)) })),
        status_counts:   statusCounts,
      },
    });
  } catch (err) {
    console.error('vendorStats error:', err.message);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}

function emptyStats(range) {
  const since = new Date();
  since.setDate(since.getDate() - (range - 1));
  const days = [];
  for (let i = 0; i < range; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push({ date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 });
  }
  return {
    range_days: range, total_orders: 0, delivered_orders: 0,
    revenue_usd: 0, avg_order_usd: 0, daily: days, top_items: [], status_counts: {},
  };
}

module.exports = { vendorStats };
