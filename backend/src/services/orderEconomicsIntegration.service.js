const {
  OrderEconomics,
} = require('../models/associations');
const {
  orderBasePayload,
} = require('./orderFinanceEvents.service');

function economicsFromOrder(order, orderType) {
  const finance = orderBasePayload(
    order,
    orderType || order.category_type
  );

  return {
    order_id: order.id,
    customer_id: order.customer_id || null,
    mzaya_id: order.rider_id || null,
    city_code: order.city || null,
    service_category: finance.orderType,
    currency: finance.currency,
    gross_order_value_minor: finance.grossOrderValueMinor,
    merchandise_value_minor: finance.merchandiseValueMinor,
    platform_revenue_minor: finance.platformFeeMinor,
    delivery_revenue_minor: finance.deliveryFeeMinor,
    procurement_revenue_minor: finance.procurementFeeMinor,
    discounts_minor: finance.discountMinor,
    taxes_minor: finance.taxMinor,
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
