const {
  OrderEconomics,
} = require('../models/associations');

function economicsFromOrder(order, orderType) {
  const grossOrderValueMinor = Number(
    order.gross_order_value_minor ??
    order.total_amount_minor ??
    order.total_minor ??
    order.total ??
    0
  );

  return {
    order_id: order.id,
    vendor_id: order.vendor_id || order.merchant_id || null,
    customer_id: order.user_id || order.customer_id || null,
    mzaya_id: order.mzaya_id || order.rider_id || order.driver_id || null,
    city_code: order.city_code || order.city || null,
    service_category: orderType,
    currency: String(order.currency || 'USD').toUpperCase(),
    gross_order_value_minor: grossOrderValueMinor,
    merchandise_value_minor: Number(
      order.merchandise_value_minor ??
      order.subtotal_minor ??
      order.subtotal ??
      0
    ),
    platform_revenue_minor: Number(
      order.platform_fee_minor ??
      order.service_fee_minor ??
      order.service_fee ??
      0
    ),
    delivery_revenue_minor: Number(
      order.delivery_fee_minor ??
      order.delivery_fee ??
      0
    ),
    procurement_revenue_minor: Number(
      order.procurement_fee_minor ??
      order.procurement_fee ??
      0
    ),
    discounts_minor: Number(
      order.discount_minor ??
      order.discount_amount_minor ??
      order.discount ??
      0
    ),
    taxes_minor: Number(
      order.tax_minor ??
      order.tax_amount_minor ??
      order.tax ??
      0
    ),
    completed_at: order.completed_at || new Date(),
    recalculated_at: new Date(),
  };
}

async function upsertOrderEconomics({
  order,
  orderType,
  transaction,
}) {
  const payload = economicsFromOrder(order, orderType);

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
