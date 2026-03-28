const { CATEGORY_TYPE, ORDER_STATUS } = require('../config/constants');
const { Order, OrderFood, OrderGrocery, OrderMaterials, OrderErrand } = require('../models/associations');
const { dispatchOrder } = require('./dispatch.service');
const { getCurrentRate } = require('./currency.service');

// ─── Create a new order ───────────────────────────────────────────────────────
async function createOrder(customerId, orderData) {
  const {
    category_type,
    city,
    pickup_address,
    pickup_location,
    dropoff_address,
    dropoff_location,
    payment_method,
    detail, // category-specific fields
  } = orderData;

  // 1. Validate category
  if (!Object.values(CATEGORY_TYPE).includes(category_type)) {
    throw new Error(`Invalid category_type: ${category_type}`);
  }

  // 2. Calculate subtotal from items (for food/grocery/materials)
  const subtotalUsd = calculateSubtotal(category_type, detail);

  // 3. Create core order record
  const order = await Order.create({
    customer_id:     customerId,
    city,
    category_type,
    pickup_address,
    pickup_location:  pickup_location || null,
    dropoff_address,
    dropoff_location: dropoff_location || null,
    payment_method,
    status:           ORDER_STATUS.PENDING,
    subtotal_usd:     subtotalUsd,
  });

  // 4. Create category-specific detail record
  await createDetailRecord(category_type, order.id, detail);

  // 5. Run dispatch — assigns vehicle, finds rider, calculates fees
  const weightKg = detail?.total_weight_kg || 0;
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
  });

  // 6. Return full order with dispatch result
  const updatedOrder = await Order.findByPk(order.id);

  return {
    order:    updatedOrder,
    dispatch,
  };
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

  // Customers can only see their own orders
  if (requesterRole === 'customer' && order.customer_id !== requesterId) {
    throw new Error('Access denied');
  }

  // Riders can only see orders assigned to them
  if (requesterRole === 'rider' && order.rider_id !== requesterId) {
    throw new Error('Access denied');
  }

  return order;
}

// ─── Get all orders for a customer ───────────────────────────────────────────
async function getCustomerOrders(customerId) {
  return Order.findAll({
    where:  { customer_id: customerId },
    order:  [['createdAt', 'DESC']],
    limit:  50,
  });
}

// ─── Get all orders assigned to a rider ──────────────────────────────────────
async function getRiderOrders(riderId) {
  return Order.findAll({
    where: {
      rider_id: riderId,
      status:   [
        ORDER_STATUS.ACCEPTED,
        ORDER_STATUS.PICKED_UP,
        ORDER_STATUS.EN_ROUTE,
        ORDER_STATUS.DELIVERED,
      ],
    },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
}

// ─── Update order status ──────────────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus, riderId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');

  // Only the assigned rider can update status
  if (order.rider_id !== riderId) throw new Error('Access denied');

  const timestamps = {
    [ORDER_STATUS.PICKED_UP]: { picked_up_at: new Date() },
    [ORDER_STATUS.EN_ROUTE]:  {},
    [ORDER_STATUS.DELIVERED]: { delivered_at: new Date() },
  };

  await order.update({
    status: newStatus,
    ...timestamps[newStatus],
  });

  return order;
}

// ─── Cancel an order ─────────────────────────────────────────────────────────
async function cancelOrder(orderId, customerId, reason) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Order not found');
  if (order.customer_id !== customerId) throw new Error('Access denied');

  // Can only cancel if not already picked up
  const cancellable = [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED];
  if (!cancellable.includes(order.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  await order.update({
    status:       ORDER_STATUS.CANCELLED,
    cancelled_at: new Date(),
    cancel_reason: reason || null,
  });

  return order;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateSubtotal(categoryType, detail) {
  if (categoryType === CATEGORY_TYPE.ERRAND) return 0; // errands priced by time
  if (!detail?.items?.length) return 0;

  return detail.items.reduce((sum, item) => {
    return sum + (item.unit_price_usd || 0) * (item.qty || 1);
  }, 0);
}

async function createDetailRecord(categoryType, orderId, detail) {
  switch (categoryType) {
    case CATEGORY_TYPE.FOOD:
      return OrderFood.create({
        order_id:               orderId,
        restaurant_id:          detail.restaurant_id,
        restaurant_name:        detail.restaurant_name,
        items:                  detail.items || [],
        special_instructions:   detail.special_instructions || null,
      });

    case CATEGORY_TYPE.GROCERY:
      return OrderGrocery.create({
        order_id:              orderId,
        store_id:              detail.store_id,
        store_name:            detail.store_name,
        items:                 detail.items || [],
        total_weight_kg:       detail.total_weight_kg || null,
        substitution_allowed:  detail.substitution_allowed || false,
        special_instructions:  detail.special_instructions || null,
      });

    case CATEGORY_TYPE.MATERIALS:
      return OrderMaterials.create({
        order_id:             orderId,
        supplier_id:          detail.supplier_id,
        supplier_name:        detail.supplier_name,
        items:                detail.items || [],
        total_weight_kg:      detail.total_weight_kg || 0,
        offloading_required:  detail.offloading_required || false,
        special_instructions: detail.special_instructions || null,
      });

    case CATEGORY_TYPE.ERRAND:
      return OrderErrand.create({
        order_id:                   orderId,
        task_description:           detail.task_description,
        task_type:                  detail.task_type || null,
        errand_location:            detail.errand_location || null,
        errand_coordinates:         detail.errand_coordinates || null,
        estimated_duration_minutes: detail.estimated_duration_minutes || 60,
        documents_required:         detail.documents_required || false,
        document_description:       detail.document_description || null,
        cash_float_required:        detail.cash_float_required || false,
        cash_float_amount_usd:      detail.cash_float_amount_usd || null,
        special_instructions:       detail.special_instructions || null,
      });

    default:
      throw new Error(`Unknown category type: ${categoryType}`);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getRiderOrders,
  updateOrderStatus,
  cancelOrder,
};