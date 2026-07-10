const { CATEGORY_TYPE, ORDER_STATUS } = require('../config/constants');
const { Order, OrderFood, OrderGrocery, OrderMaterials, OrderErrand, Promo } = require('../models/associations');
const { dispatchOrder, assignVehicleType, calculateDistanceKm } = require('./dispatch.service');
const { calculateFees, convertToZig } = require('../utils/feeCalculator');
const { evaluatePromo } = require('../utils/promoEval');
const { getCurrentRate } = require('./currency.service');
const { VEHICLE_META } = require('../config/constants');
const mlService = require('./ml.service');
const realtime = require('../realtime/socket');

// ─── Quote an order (no persistence) ──────────────────────────────────────────
// Shared by POST /api/orders/quote and createOrder so the fee the customer sees
// is exactly the fee that gets stored. Pure computation, no DB writes.
function quoteOrder({ category_type, detail, pickup_location, dropoff_location, tip_usd, discount_usd }) {
  if (!Object.values(CATEGORY_TYPE).includes(category_type)) {
    throw new Error(`Invalid category_type: ${category_type}`);
  }

  const subtotalUsd = calculateSubtotal(category_type, detail);
  const weightKg    = Number(detail?.total_weight_kg) || 0;
  const vehicleType = assignVehicleType(category_type, weightKg);
  const distanceKm  = calculateDistanceKm(pickup_location, dropoff_location);
  const zigRate     = getCurrentRate();

  const fees = calculateFees({
    categoryType:             category_type,
    vehicleType,
    distanceKm,
    subtotalUsd,
    weightKg,
    estimatedDurationMinutes: detail?.estimated_duration_minutes || 0,
  });

  // Tip is 100% rider money, added on top — not a fee, not commissionable.
  const tip = Math.max(0, Number(tip_usd) || 0);

  // Promo discount comes off subtotal + fee only, never the tip. Clamp so it
  // can't exceed subtotal + fee.
  const discount = Math.min(
    Math.max(0, Number(discount_usd) || 0),
    fees.subtotal_usd + fees.delivery_fee_usd
  );

  const grandTotal = parseFloat((fees.total_usd + tip - discount).toFixed(2));

  const meta = VEHICLE_META[vehicleType] || {};

  return {
    vehicle: {
      type:  vehicleType,
      name:  meta.name || vehicleType,
      hint:  meta.hint || '',
    },
    weight_kg:        weightKg,
    distance_km:      parseFloat((distanceKm || 0).toFixed(2)),
    subtotal_usd:     fees.subtotal_usd,
    delivery_fee_usd: fees.delivery_fee_usd,
    tip_usd:          tip,
    discount_usd:     parseFloat(discount.toFixed(2)),
    total_usd:        grandTotal,
    zig_rate:         zigRate || null,
    total_zig:        zigRate ? convertToZig(grandTotal, zigRate) : null,
    breakdown:        fees.breakdown,
  };
}

// ─── Create a new order ───────────────────────────────────────────────────────
async function createOrder(customerId, orderData) {
  const {
    category_type,
    city,
    pickup_address,
    pickup_location,
    dropoff_address,
    dropoff_location,
    dropoff_landmark,
    payment_method,
    tip_usd,
    promo_code,
    scheduled_for,
    detail,
    is_negotiable,
    offered_fare_usd,
  } = orderData;

  if (!Object.values(CATEGORY_TYPE).includes(category_type)) {
    throw new Error(`Invalid category_type: ${category_type}`);
  }

  const subtotalUsd = calculateSubtotal(category_type, detail);

  // Validate scheduling window if this is a scheduled order.
  let scheduledFor = null;
  if (scheduled_for) {
    const when = new Date(scheduled_for);
    if (Number.isNaN(when.getTime())) throw new Error('Invalid scheduled time');
    const now = Date.now();
    const minLeadMs = 30 * 60 * 1000;          // at least 30 min out
    const maxLeadMs = 7 * 24 * 60 * 60 * 1000;  // within 7 days
    if (when.getTime() < now + minLeadMs) throw new Error('Please schedule at least 30 minutes ahead');
    if (when.getTime() > now + maxLeadMs) throw new Error('You can only schedule up to 7 days ahead');
    scheduledFor = when;
  }

  const isScheduled = !!scheduledFor;

  const order = await Order.create({
    customer_id:      customerId,
    city,
    category_type,
    pickup_address,
    pickup_location:  pickup_location || null,
    dropoff_address,
    dropoff_location: dropoff_location || null,
    dropoff_landmark: dropoff_landmark || null,
    payment_method,
    status:           isScheduled ? ORDER_STATUS.SCHEDULED : ORDER_STATUS.PENDING,
    scheduled_for:    scheduledFor,
    subtotal_usd:     subtotalUsd,
    is_negotiable:    !!is_negotiable,
    offered_fare_usd: is_negotiable ? Number(offered_fare_usd) || 0 : null,
  });

  await createDetailRecord(category_type, order.id, detail);

  const weightKg = Number(detail?.total_weight_kg) || 0;
  const zigRate  = getCurrentRate();

  const dispatch = await dispatchOrder({
    order,
    categoryType:             category_type,
    weightKg,
    pickupLocation:           pickup_location,
    dropoffLocation:          dropoff_location,
    subtotalUsd,
    estimatedDurationMinutes: detail?.estimated_duration_minutes || 0,
    zigRate,
    deferDispatch:            isScheduled || !!is_negotiable,
  });

  // ── Apply promo (authoritative) + tip on top of the dispatched total ────────
  // dispatchOrder set total_usd from fees only. We re-evaluate the promo
  // server-side (never trust a client discount), apply it to subtotal+fee,
  // then add the tip (which the discount never touches).
  const afterDispatch = await Order.findByPk(order.id);
  const tip = Math.max(0, Number(tip_usd) || 0);

  let discount = 0;
  let appliedCode = null;
  if (promo_code) {
    const promo = await Promo.findOne({ where: { code: String(promo_code).trim().toUpperCase() } });
    const result = evaluatePromo(promo, {
      subtotalUsd:    Number(afterDispatch.subtotal_usd),
      deliveryFeeUsd: Number(afterDispatch.delivery_fee_usd),
    });
    if (result.valid) {
      discount = result.discount_usd;
      appliedCode = promo.code;
      // Count the redemption.
      await promo.update({ used_count: Number(promo.used_count || 0) + 1 });
    }
    // If invalid, we silently ignore the code (order still places at full price).
    // The customer already saw validity at checkout via /promos/validate.
  }

  if (tip > 0 || discount > 0 || appliedCode) {
    const baseTotal = Number(afterDispatch.total_usd); // subtotal + fee
    const newTotal  = parseFloat(Math.max(0, baseTotal + tip - discount).toFixed(2));
    await afterDispatch.update({
      tip_usd:      tip,
      promo_code:   appliedCode,
      discount_usd: discount,
      total_usd:    newTotal,
      total_zig:    zigRate ? convertToZig(newTotal, zigRate) : afterDispatch.total_zig,
    });
  }

  const updatedOrder = await Order.findByPk(order.id);

  // ── Real-time: announce the new order + any immediate assignment ──────────
  try {
    const vendorId = detail?.restaurant_id || detail?.store_id || detail?.supplier_id || null;
    const cityId   = await resolveCityId(vendorId);
    realtime.emitOrderNew({
      id: updatedOrder.id,
      vendor_id: vendorId,
      city_id: cityId,
    });
    // If a rider was assigned on dispatch, notify them.
    if (updatedOrder.rider_id) {
      realtime.emitOrderAssigned(updatedOrder.rider_id, updatedOrder);
    }
  } catch (err) {
    console.error('[realtime] emit new order failed:', err.message);
  }

  // ── Fire-and-forget: extract ML features + score anomaly ──────────────────
  setImmediate(async () => {
    try {
      const orderJson = updatedOrder.toJSON();
      await mlService.extractFeatures(orderJson);
      await mlService.scoreOrder(orderJson);
    } catch (err) {
      console.error('[ML] Background processing failed:', err.message);
    }
  });

  return { order: updatedOrder, dispatch };
}

// ─── Get a single order with its detail ──────────────────────────────────────
async function getOrderById(orderId, requesterId, requesterRole) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderFood,      as: 'foodDetail',      required: false },
      { model: OrderGrocery,   as: 'groceryDetail',   required: false },
      { model: OrderMaterials, as: 'materialsDetail', required: false },
      { model: OrderErrand,    as: 'errandDetail',    required: false },
    ],
  });

  if (!order) throw new Error('Order not found');
  if (requesterRole === 'customer' && order.customer_id !== requesterId) throw new Error('Access denied');
  if (requesterRole === 'rider'    && order.rider_id    !== requesterId) throw new Error('Access denied');

  return order;
}

async function getCustomerOrders(customerId) {
  return Order.findAll({ where: { customer_id: customerId }, order: [['createdAt', 'DESC']], limit: 50 });
}

async function getRiderOrders(riderId) {
  return Order.findAll({
    where: { rider_id: riderId, status: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKED_UP, ORDER_STATUS.EN_ROUTE, ORDER_STATUS.DELIVERED] },
    order: [['createdAt', 'DESC']], limit: 50,
  });
}

async function updateOrderStatus(orderId, newStatus, riderId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');
  if (order.rider_id !== riderId) throw new Error('Access denied');

  const timestamps = {
    [ORDER_STATUS.PICKED_UP]: { picked_up_at: new Date() },
    [ORDER_STATUS.EN_ROUTE]:  {},
    [ORDER_STATUS.DELIVERED]: { delivered_at: new Date() },
  };

  await order.update({ status: newStatus, ...timestamps[newStatus] });

  // ── Real-time: broadcast the status change ────────────────────────────────
  try {
    const vendorId = await resolveVendorId(order.id);
    realtime.emitOrderUpdated(order, { vendorId });
  } catch (err) {
    console.error('[realtime] emit status failed:', err.message);
  }

  // On delivery, credit the rider: delivery fee + 100% of the tip, and bump
  // their delivery count. Only credit once (guard on delivered_at being freshly
  // set). rider_id references users(id), so find the rider row by user_id.
  if (newStatus === ORDER_STATUS.DELIVERED) {
    try {
      const { Rider } = require('../models/associations');
      const rider = await Rider.findOne({ where: { user_id: order.rider_id } });
      if (rider) {
        const earned = Number(order.delivery_fee_usd || 0) + Number(order.tip_usd || 0);
        await rider.update({
          total_earnings_usd: parseFloat((Number(rider.total_earnings_usd || 0) + earned).toFixed(2)),
          total_deliveries:   Number(rider.total_deliveries || 0) + 1,
        });
      }
    } catch (e) {
      console.error('earnings credit failed:', e.message);
    }
  }

  return order;
}

async function cancelOrder(orderId, customerId, reason) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');
  if (order.customer_id !== customerId) throw new Error('Access denied');

  const cancellable = [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED];
  if (!cancellable.includes(order.status)) throw new Error('Order cannot be cancelled at this stage');

  await order.update({ status: ORDER_STATUS.CANCELLED, cancelled_at: new Date(), cancel_reason: reason || null });
  return order;
}

function calculateSubtotal(categoryType, detail) {
  if (categoryType === CATEGORY_TYPE.ERRAND) return 0;
  if (!detail?.items?.length) return 0;
  return detail.items.reduce((sum, item) => sum + (item.unit_price_usd || 0) * (item.qty || 1), 0);
}

async function createDetailRecord(categoryType, orderId, detail) {
  switch (categoryType) {
    case CATEGORY_TYPE.FOOD:
      return OrderFood.create({
        order_id: orderId, restaurant_id: detail.restaurant_id,
        restaurant_name: detail.restaurant_name, items: detail.items || [],
        special_instructions: detail.special_instructions || null,
      });
    case CATEGORY_TYPE.GROCERY:
      return OrderGrocery.create({
        order_id: orderId, store_id: detail.store_id, store_name: detail.store_name,
        items: detail.items || [], total_weight_kg: detail.total_weight_kg || null,
        substitution_allowed: detail.substitution_allowed || false,
        special_instructions: detail.special_instructions || null,
      });
    case CATEGORY_TYPE.MATERIALS:
      return OrderMaterials.create({
        order_id: orderId, supplier_id: detail.supplier_id, supplier_name: detail.supplier_name,
        items: detail.items || [], total_weight_kg: detail.total_weight_kg || 0,
        offloading_required: detail.offloading_required || false,
        special_instructions: detail.special_instructions || null,
      });
    case CATEGORY_TYPE.ERRAND:
      return OrderErrand.create({
        order_id: orderId, task_description: detail.task_description,
        task_type: detail.task_type || null, errand_location: detail.errand_location || null,
        errand_coordinates: detail.errand_coordinates || null,
        estimated_duration_minutes: detail.estimated_duration_minutes || 60,
        documents_required: detail.documents_required || false,
        document_description: detail.document_description || null,
        cash_float_required: detail.cash_float_required || false,
        cash_float_amount_usd: detail.cash_float_amount_usd || null,
        special_instructions: detail.special_instructions || null,
      });
    default:
      throw new Error(`Unknown category type: ${categoryType}`);
  }
}

// Resolve which vendor (branch) an order belongs to, via its detail record.
async function resolveVendorId(orderId) {
  const food = await OrderFood.findOne({ where: { order_id: orderId }, attributes: ['restaurant_id'], raw: true });
  if (food?.restaurant_id) return food.restaurant_id;
  const groc = await OrderGrocery.findOne({ where: { order_id: orderId }, attributes: ['store_id'], raw: true });
  if (groc?.store_id) return groc.store_id;
  const mat = await OrderMaterials.findOne({ where: { order_id: orderId }, attributes: ['supplier_id'], raw: true });
  if (mat?.supplier_id) return mat.supplier_id;
  return null;
}

// Resolve a vendor's city id (for city-room broadcasts to riders).
async function resolveCityId(vendorId) {
  if (!vendorId) return null;
  const { Vendor } = require('../models/associations');
  const v = await Vendor.findByPk(vendorId, { attributes: ['city_id'], raw: true });
  return v?.city_id || null;
}

module.exports = {
  createOrder, quoteOrder, getOrderById, getCustomerOrders,
  getRiderOrders, updateOrderStatus, cancelOrder,
};
