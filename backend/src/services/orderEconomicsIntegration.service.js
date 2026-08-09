const {
  OrderEconomics,
} = require('../models/associations');
const {
  usdToMinor,
} = require('./orderFinanceEvents.service');

function economicsFromOrder(order) {
  const gross = usdToMinor(order.total_usd);
  const deliveryRevenue = usdToMinor(order.delivery_fee_usd);
  const discounts = usdToMinor(order.discount_usd);

  return {
    order_id: order.id,
    customer_id: order.customer_id || null,
    mzaya_id: order.rider_id || null,
    city_code: order.city || null,
    service_category: order.category_type,
    currency: String(order.currency_paid || 'USD').toUpperCase(),
    gross_order_value_minor: gross,
    merchandise_value_minor: usdToMinor(order.subtotal_usd),
    platform_revenue_minor: 0,
    delivery_revenue_minor: deliveryRevenue,
    procurement_revenue_minor: 0,
    discounts_minor: discounts,
    taxes_minor: 0,
    completed_at: order.delivered_at || new Date(),
    recalculated_at: new Date(),
  };
}

async function upsertOrderEconomics({
  order,
  transaction,
}) {
  const payload = economicsFromOrder(order);

  const existing = await OrderEconomics.findOne({
    where: { order_id: order.id },
    transaction,
  });

  if (existing) {
    await existing.update(payload, { transaction });
    return existing;
  }

  return OrderEconomics.create(payload, { transaction });
}

module.exports = {
  economicsFromOrder,
  upsertOrderEconomics,
};
