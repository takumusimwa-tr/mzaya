const { CATEGORY_TYPE, ORDER_STATUS } = require('../config/constants');
const { Order, OrderFood, OrderGrocery, OrderMaterials, OrderErrand, Promo, MenuItem } = require('../models/associations');
const { dispatchOrder, assignVehicleType, calculateDistanceKm } = require('./orderDispatch.service');
const { calculateFees, convertToZig } = require('../utils/feeCalculator');
const { evaluatePromo } = require('../utils/promoEval');
const { getCurrentRate } = require('./currency.service');
const { VEHICLE_META } = require('../config/constants');
const mlService = require('./ml.service');
const {
  publishOrderCreated,
  publishOrderStatusChanged,
  publishOrderAssigned,
} = require('../realtime/orderPublisher');
const { logger } = require('../utils/logger');
const { sequelize } = require('../config/db');
const { createHash } = require('node:crypto');
const { emitOrderCancelled } = require('./orderFinanceEvents.service');

// Resolve customer cart items against the active vendor catalog. Never use
// client-provided prices, availability or weight for monetary calculations.
async function resolveCatalogDetail(categoryType, detail) {
  if (categoryType === CATEGORY_TYPE.ERRAND) return detail;
  const vendorId = categoryType === CATEGORY_TYPE.FOOD ? detail?.restaurant_id
    : categoryType === CATEGORY_TYPE.GROCERY ? detail?.store_id
    : categoryType === CATEGORY_TYPE.MATERIALS ? detail?.supplier_id : null;
  if (!vendorId || !Array.isArray(detail?.items) || !detail.items.length) {
    throw new Error('A vendor and at least one catalog item are required');
  }
  const ids = detail.items.map((item) => item?.menu_item_id);
  if (ids.some((id) => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    throw new Error('Invalid or duplicate catalog items');
  }
  const catalog = await MenuItem.findAll({ where: { id: ids, vendor_id: vendorId, is_available: true } });
  if (catalog.length !== ids.length) throw new Error('Some items are unavailable or do not belong to this vendor');
  const byId = new Map(catalog.map((item) => [String(item.id), item]));
  const items = detail.items.map((item) => {
    const stored = byId.get(item.menu_item_id);
    const qty = Number(item.qty);
    const price = Number(stored?.price_usd);
    const weight = Number(stored?.weight_kg || 0);
    if (!Number.isSafeInteger(qty) || qty <= 0 || !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(weight) || weight < 0) {
      throw new Error('Invalid catalog price, weight or item quantity');
    }
    return { ...item, name: stored.name, unit_price_usd: price, weight_kg: weight, qty };
  });
  const totalWeight = items.reduce((sum, item) => sum + item.qty * item.weight_kg, 0);
  if (!Number.isFinite(totalWeight)) throw new Error('Invalid order weight');
  return { ...detail, items, total_weight_kg: totalWeight };
}

// ─── Quote an order (no persistence) ──────────────────────────────────────────
// Shared by POST /api/orders/quote and createOrder so the fee the customer sees
// is exactly the fee that gets stored. Pure computation, no DB writes.
async function quoteOrder({ category_type, detail, pickup_location, dropoff_location, tip_usd, discount_usd }) {
  if (!Object.values(CATEGORY_TYPE).includes(category_type)) {
    throw new Error(`Invalid category_type: ${category_type}`);
  }

  const catalogDetail = await resolveCatalogDetail(category_type, detail);
  const subtotalUsd = calculateSubtotal(category_type, catalogDetail);
  const weightKg    = Number(catalogDetail?.total_weight_kg) || 0;
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

// Canonicalize request JSON so object key ordering does not affect retries.
// Array order is retained; checkout item ordering is part of the request.
function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function checkoutFingerprint(orderData) {
  const { client_request_id: _ignored, ...payload } = orderData;
  return createHash('sha256').update(JSON.stringify(canonicalJson(payload))).digest('hex');
}

function assertSameCheckout(existing, fingerprint) {
  // Existing rows without a fingerprint cannot be safely compared.
  if (existing.request_fingerprint !== fingerprint) {
    const error = new Error('Checkout request ID was already used with different order details');
    error.status = 409;
    error.statusCode = 409;
    throw error;
  }
}

// ─── Create a new order ───────────────────────────────────────────────────────
async function createOrder(customerId, orderData) {
  const {
    category_type,
    client_request_id,
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

  const verifiedDetail = await resolveCatalogDetail(category_type, detail);
  const subtotalUsd = calculateSubtotal(category_type, verifiedDetail);

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

  const requestFingerprint = client_request_id ? checkoutFingerprint(orderData) : null;

  // The request UUID must be validated before entering the transaction.
  if (client_request_id &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(client_request_id)) {
    throw new Error('Invalid checkout request identifier');
  }

  // A committed replay is safe to return; concurrent retries are serialized
  // by the unique index and handled after the failed transaction rolls back.
  if (client_request_id) {
    const existing = await Order.findOne({ where: { client_request_id, customer_id: customerId } });
    if (existing) {
        assertSameCheckout(existing, requestFingerprint);
        return { order: existing, dispatch: null, replayed: true };
      }
  }

  let result;
  try {
    result = await sequelize.transaction(async (transaction) => {
      const order = await Order.create({
        customer_id: customerId,
        client_request_id: client_request_id || null,
        request_fingerprint: requestFingerprint,
        city, category_type, pickup_address,
        pickup_location: pickup_location || null,
        dropoff_address,
        dropoff_location: dropoff_location || null,
        dropoff_landmark: dropoff_landmark || null,
        payment_method,
        status: isScheduled ? ORDER_STATUS.SCHEDULED : ORDER_STATUS.PENDING,
        scheduled_for: scheduledFor,
        subtotal_usd: subtotalUsd,
        is_negotiable: !!is_negotiable,
        offered_fare_usd: is_negotiable ? Number(offered_fare_usd) || 0 : null,
      }, { transaction });

      await createDetailRecord(category_type, order.id, verifiedDetail, transaction);
      const weightKg = Number(verifiedDetail?.total_weight_kg) || 0;
      const zigRate = getCurrentRate();
      const dispatch = await dispatchOrder({
        order, categoryType: category_type, weightKg,
        pickupLocation: pickup_location, dropoffLocation: dropoff_location,
        subtotalUsd,
        estimatedDurationMinutes: verifiedDetail?.estimated_duration_minutes || 0,
        zigRate, deferDispatch: isScheduled || !!is_negotiable,
        transaction,
      });

      const tip = Math.max(0, Number(tip_usd) || 0);
      let discount = 0;
      let appliedCode = null;
      if (promo_code) {
        const promo = await Promo.findOne({
          where: { code: String(promo_code).trim().toUpperCase() },
          transaction, lock: transaction.LOCK.UPDATE,
        });
        const result = evaluatePromo(promo, {
          subtotalUsd: Number(order.subtotal_usd),
          deliveryFeeUsd: Number(order.delivery_fee_usd),
        });
        if (result.valid) {
          discount = result.discount_usd;
          appliedCode = promo.code;
          await promo.update({ used_count: Number(promo.used_count || 0) + 1 }, { transaction });
        }
      }

      if (tip > 0 || discount > 0 || appliedCode) {
        const total = Number(order.total_usd);
        const finalTotal = parseFloat(Math.max(0, total + tip - discount).toFixed(2));
        await order.update({
          tip_usd: tip, promo_code: appliedCode, discount_usd: discount,
          total_usd: finalTotal,
          total_zig: zigRate ? convertToZig(finalTotal, zigRate) : order.total_zig,
        }, { transaction });
      }
      return { order, dispatch };
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError' && client_request_id) {
      const existing = await Order.findOne({ where: { client_request_id, customer_id: customerId } });
      if (existing) {
        assertSameCheckout(existing, requestFingerprint);
        return { order: existing, dispatch: null, replayed: true };
      }
    }
    throw err;
  }

  // All order writes have committed before notifications or ML are triggered.
  const { order: updatedOrder, dispatch } = result;

  // ── Real-time: announce the new order + any immediate assignment ──────────
  try {
    const vendorId = detail?.restaurant_id || detail?.store_id || detail?.supplier_id || null;
    const cityId   = await resolveCityId(vendorId);
    publishOrderCreated({
      id: updatedOrder.id,
      status: updatedOrder.status,
      customer_id: updatedOrder.customer_id,
      rider_id: updatedOrder.rider_id,
      vendor_id: vendorId,
      city_id: cityId,
    });
    // If a rider was assigned on dispatch, notify them.
    if (updatedOrder.rider_id) {
      publishOrderAssigned(updatedOrder, updatedOrder.rider_id);
    }
  } catch (err) {
    logger.error('realtime_emit_new_order_failed_error', { error: err.message });
  }

  // ── Fire-and-forget: extract ML features + score anomaly ──────────────────
  setImmediate(async () => {
    try {
      const orderJson = updatedOrder.toJSON();
      await mlService.extractFeatures(orderJson);
      await mlService.scoreOrder(orderJson);
    } catch (err) {
      logger.error('ml_background_processing_failed_error', { error: err.message });
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

  // Authorization.
  //
  // This used to check customers and riders and then FALL THROUGH for vendors —
  // no check at all. Any vendor could therefore read any order in the system,
  // including a competitor's: customer names, phone numbers, delivery addresses,
  // totals. Just by changing the UUID in the URL.
  //
  // The route layer now guards this with loadOrder(), but the service closes it
  // too. A hole this bad should not depend on a caller remembering to wrap it.
  if (requesterRole === 'admin') return order;

  if (requesterRole === 'customer') {
    if (order.customer_id !== requesterId) throw new Error('Access denied');
    return order;
  }

  if (requesterRole === 'rider') {
    if (order.rider_id !== requesterId) throw new Error('Access denied');
    return order;
  }

  if (requesterRole === 'vendor') {
    // Only the vendor whose branch is actually fulfilling this order.
    const vendorId = await resolveVendorId(order.id);
    if (!vendorId) throw new Error('Access denied');   // errands have no vendor

    const { Vendor } = require('../models/associations');
    const branch = await Vendor.findByPk(vendorId, { attributes: ['owner_id'], raw: true });
    if (!branch || branch.owner_id !== requesterId) throw new Error('Access denied');
    return order;
  }

  // Unknown role — deny. Fail closed.
  throw new Error('Access denied');
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


async function updateOrderStatus(orderId, newStatus, riderId, deliveryProofUrl = null) {
  // One-way lifecycle; terminal orders cannot be reopened by a stale client.
  const transitions = {
    [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PICKED_UP],
    [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.EN_ROUTE],
    [ORDER_STATUS.EN_ROUTE]: [ORDER_STATUS.DELIVERED],
  };
  const result = await sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!order) throw new Error('Order not found');
    if (order.rider_id !== riderId) throw new Error('Access denied');

    // Idempotent delivery replay: no duplicate finance or earnings.
    if (newStatus === ORDER_STATUS.DELIVERED && order.status === ORDER_STATUS.DELIVERED) {
      return { order, changed: false };
    }
    if (!transitions[order.status]?.includes(newStatus)) {
      const error = new Error('Invalid order status transition');
      error.status = 409;
      throw error;
    }
    if (newStatus === ORDER_STATUS.DELIVERED &&
        (typeof deliveryProofUrl !== 'string' || !deliveryProofUrl.trim())) {
      throw new Error('A delivery proof photo is required');
    }

    const timestamps = {
      [ORDER_STATUS.PICKED_UP]: { picked_up_at: new Date() },
      [ORDER_STATUS.EN_ROUTE]: {},
      [ORDER_STATUS.DELIVERED]: {
        delivered_at: new Date(),
        delivery_proof_url: typeof deliveryProofUrl === 'string' ? deliveryProofUrl.trim() : null,
      },
    };
    await order.update({ status: newStatus, ...timestamps[newStatus] }, { transaction });

    if (newStatus === ORDER_STATUS.DELIVERED) {
      const { applyDeliveryCompletionEffects } = require('./deliveryCompletion.service');
      await applyDeliveryCompletionEffects({ order, transaction });
    }
    return { order, changed: true };
  });

  if (result.changed) {
    try {
      const vendorId = await resolveVendorId(result.order.id);
      publishOrderStatusChanged(result.order, { vendorId });
    } catch (err) {
      logger.error('realtime_emit_status_failed_error', { error: err.message });
    }
  }
  return result.order;
}

async function cancelOrder(orderId, customerId, reason) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) throw new Error('Order not found');
    if (order.customer_id !== customerId) {
      throw new Error('Access denied');
    }

    // SCHEDULED: a future order nobody has been sent for yet is the safest kind
    // to cancel. It used to be refused, so a customer who booked for next week
    // had no way out. The release job only picks up status='scheduled' orders,
    // so a cancelled one is never dispatched.
    const cancellable = [
      ORDER_STATUS.SCHEDULED,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.ACCEPTED,
    ];

    if (!cancellable.includes(order.status)) {
      throw new Error(
        'Order cannot be cancelled at this stage'
      );
    }

    await order.update({
      status: ORDER_STATUS.CANCELLED,
      cancelled_at: new Date(),
      cancel_reason: reason || null,
    }, { transaction });

    await emitOrderCancelled({
      order,
      transaction,
      reason: reason || null,
    });

    return order;
  });
}

function calculateSubtotal(categoryType, detail) {
  if (categoryType === CATEGORY_TYPE.ERRAND) return 0;
  if (!Array.isArray(detail?.items) || detail.items.length === 0) {
    throw new Error('An order must contain at least one item');
  }

  // Reject malformed totals before either quote or order creation. This does
  // not replace server-side catalog price verification (tracked separately).
  const subtotal = detail.items.reduce((sum, item) => {
    const quantity = Number(item?.qty);
    const unitPrice = Number(item?.unit_price_usd);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error('Each item must have a positive whole-number quantity');
    }
    if (item?.unit_price_usd == null || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error('Each item must have a valid non-negative unit price');
    }
    const lineTotal = quantity * unitPrice;
    if (!Number.isFinite(lineTotal)) {
      throw new Error('Order subtotal is invalid');
    }
    return sum + lineTotal;
  }, 0);
  if (!Number.isFinite(subtotal)) throw new Error('Order subtotal is invalid');
  return subtotal;
}

async function createDetailRecord(categoryType, orderId, detail, transaction) {
  switch (categoryType) {
    case CATEGORY_TYPE.FOOD:
      return OrderFood.create({
        order_id: orderId, restaurant_id: detail.restaurant_id,
        restaurant_name: detail.restaurant_name, items: detail.items || [],
        special_instructions: detail.special_instructions || null,
      }, { transaction });
    case CATEGORY_TYPE.GROCERY:
      return OrderGrocery.create({
        order_id: orderId, store_id: detail.store_id, store_name: detail.store_name,
        items: detail.items || [], total_weight_kg: detail.total_weight_kg || null,
        substitution_allowed: detail.substitution_allowed || false,
        special_instructions: detail.special_instructions || null,
      }, { transaction });
    case CATEGORY_TYPE.MATERIALS:
      return OrderMaterials.create({
        order_id: orderId, supplier_id: detail.supplier_id, supplier_name: detail.supplier_name,
        items: detail.items || [], total_weight_kg: detail.total_weight_kg || 0,
        offloading_required: detail.offloading_required || false,
        special_instructions: detail.special_instructions || null,
      }, { transaction });
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
      }, { transaction });
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
  resolveVendorId,
};
