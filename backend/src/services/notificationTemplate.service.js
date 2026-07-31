const TEMPLATE_BUILDERS = Object.freeze({
  'order.placed': ({ order }) => ({
    category: 'order',
    priority: 'normal',
    title: 'Order placed',
    body: `Order #${shortId(order.id)} has been placed successfully.`,
    icon: 'order-placed',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'order.confirmed': ({ order }) => ({
    category: 'order',
    priority: 'normal',
    title: 'Order confirmed',
    body: 'The vendor has confirmed your order.',
    icon: 'order-confirmed',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'order.preparing': ({ order }) => ({
    category: 'order',
    priority: 'normal',
    title: 'Your order is being prepared',
    body: 'The vendor has started preparing your order.',
    icon: 'order-preparing',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'order.ready': ({ order }) => ({
    category: 'order',
    priority: 'high',
    title: 'Order ready for pickup',
    body: 'Your order is ready. We are assigning a Mzaya now.',
    icon: 'order-ready',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'order.rider_assigned': ({ order }) => ({
    category: 'order',
    priority: 'high',
    title: 'Mzaya assigned',
    body: 'A Mzaya has accepted your delivery.',
    icon: 'mzaya-assigned',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status, riderId: order.rider_id },
  }),

  'order.picked_up': ({ order }) => ({
    category: 'order',
    priority: 'high',
    title: 'Order picked up',
    body: 'Your Mzaya has collected the order.',
    icon: 'order-picked-up',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status, riderId: order.rider_id },
  }),

  'order.en_route': ({ order }) => ({
    category: 'order',
    priority: 'high',
    title: 'Your order is on the way',
    body: 'Your Mzaya is heading to the delivery address.',
    icon: 'order-en-route',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status, riderId: order.rider_id },
  }),

  'order.delivered': ({ order }) => ({
    category: 'order',
    priority: 'normal',
    title: 'Order delivered',
    body: 'Your order has been delivered successfully.',
    icon: 'order-delivered',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'order.cancelled': ({ order }) => ({
    category: 'order',
    priority: 'urgent',
    title: 'Order cancelled',
    body: 'This order has been cancelled.',
    icon: 'order-cancelled',
    actionUrl: `/orders/${order.id}`,
    data: { orderId: order.id, status: order.status },
  }),

  'dispatch.offer_created': ({ order, offer }) => ({
    category: 'dispatch',
    priority: 'urgent',
    title: 'New delivery available',
    body: `Order #${shortId(order.id)} is ready for pickup.`,
    icon: 'dispatch-offer',
    actionUrl: '/mzaya/orders/available',
    data: {
      orderId: order.id,
      offerId: offer.id,
      expiresAt: offer.expires_at,
      pickupEtaMinutes: offer.pickup_eta_minutes,
      distanceKm: offer.distance_km,
    },
  }),

  'dispatch.offer_expired': ({ order }) => ({
    category: 'dispatch',
    priority: 'normal',
    title: 'Delivery offer expired',
    body: `Order #${shortId(order.id)} has been offered to another Mzaya.`,
    icon: 'dispatch-expired',
    actionUrl: '/mzaya/orders/available',
    data: { orderId: order.id },
  }),

  'vendor.new_order': ({ order }) => ({
    category: 'vendor',
    priority: 'urgent',
    title: 'New order received',
    body: `Order #${shortId(order.id)} is waiting for confirmation.`,
    icon: 'vendor-new-order',
    actionUrl: '/vendor/orders/live',
    data: { orderId: order.id, vendorId: order.vendor_id },
  }),

  'vendor.order_cancelled': ({ order }) => ({
    category: 'vendor',
    priority: 'high',
    title: 'Order cancelled',
    body: `Order #${shortId(order.id)} has been cancelled.`,
    icon: 'vendor-order-cancelled',
    actionUrl: '/vendor/orders/live',
    data: { orderId: order.id, vendorId: order.vendor_id },
  }),
});

function shortId(value) {
  return String(value || '').slice(0, 8).toUpperCase();
}

function serviceError(message, status = 400, code = 'NOTIFICATION_TEMPLATE_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function renderTemplate(eventKey, context = {}) {
  const builder = TEMPLATE_BUILDERS[eventKey];
  if (!builder) {
    throw serviceError(
      `No notification template registered for ${eventKey}`,
      422,
      'TEMPLATE_NOT_FOUND'
    );
  }

  const rendered = builder(context);
  if (!rendered?.title || !rendered?.body || !rendered?.category) {
    throw serviceError(
      `Notification template ${eventKey} is incomplete`,
      500,
      'INVALID_TEMPLATE'
    );
  }

  return {
    eventKey,
    priority: 'normal',
    icon: null,
    actionUrl: null,
    data: {},
    ...rendered,
  };
}

function hasTemplate(eventKey) {
  return Boolean(TEMPLATE_BUILDERS[eventKey]);
}

module.exports = {
  TEMPLATE_BUILDERS,
  shortId,
  renderTemplate,
  hasTemplate,
};
