/**
 * MZAYA order event publisher.
 * Converts internal domain events into small, stable Socket.IO payloads.
 */
const { rooms } = require('./rooms');

let io = null;

function setOrderPublisherIO(socketServer) {
  io = socketServer;
}

function compactOrderPayload(order, extra = {}) {
  return {
    orderId: order.id,
    status: order.status,
    customerId: order.customer_id || null,
    riderId: order.rider_id || null,
    vendorId: order.vendor_id || extra.vendorId || null,
    cityId: order.city_id || order.city || null,
    updatedAt:
      order.updatedAt?.toISOString?.() ||
      order.updated_at ||
      new Date().toISOString(),
    ...extra,
  };
}

function emitToOrderParticipants(eventName, order, extra = {}) {
  if (!io || !order?.id) return;

  const payload = compactOrderPayload(order, extra);

  io.to(rooms.order(order.id)).emit(eventName, payload);

  if (payload.customerId) {
    io.to(rooms.user(payload.customerId)).emit(eventName, payload);
  }
  if (payload.riderId) {
    io.to(rooms.user(payload.riderId)).emit(eventName, payload);
  }
  if (payload.vendorId) {
    io.to(rooms.vendor(payload.vendorId)).emit(eventName, payload);
  }

  io.to(rooms.admins()).emit(eventName, payload);
}

function publishOrderCreated(order) {
  if (!io || !order?.id) return;
  const payload = compactOrderPayload(order);

  if (payload.vendorId) {
    io.to(rooms.vendor(payload.vendorId)).emit('order:new', payload);
  }
  if (payload.cityId) {
    io.to(rooms.city(payload.cityId)).emit('order:available', payload);
  }
  io.to(rooms.admins()).emit('order:new', payload);
}

function publishOrderStatusChanged(order, transition = {}) {
  emitToOrderParticipants('order:status_changed', order, {
    fromStatus: transition.fromStatus || null,
    changedAt:
      transition.changedAt?.toISOString?.() ||
      transition.changedAt ||
      new Date().toISOString(),
  });
}

function publishOrderAssigned(order, riderUserId) {
  if (!io || !order?.id || !riderUserId) return;

  const payload = compactOrderPayload(order, {
    riderId: riderUserId,
    assignedAt: new Date().toISOString(),
  });

  io.to(rooms.user(riderUserId)).emit('order:assigned', payload);
  emitToOrderParticipants('order:assignment_changed', order, payload);
}

function publishRiderLocation({ order, location }) {
  if (!io || !order?.id || !location) return;

  const payload = {
    orderId: order.id,
    riderId: order.rider_id,
    lat: Number(location.lat),
    lng: Number(location.lng),
    accuracy:
      location.accuracy == null ? null : Number(location.accuracy),
    heading:
      location.heading == null ? null : Number(location.heading),
    speed: location.speed == null ? null : Number(location.speed),
    recordedAt: location.recordedAt || new Date().toISOString(),
  };

  io.to(rooms.order(order.id)).emit('rider:location', payload);
  if (order.customer_id) {
    io.to(rooms.user(order.customer_id)).emit('rider:location', payload);
  }
}

module.exports = {
  setOrderPublisherIO,
  compactOrderPayload,
  publishOrderCreated,
  publishOrderStatusChanged,
  publishOrderAssigned,
  publishRiderLocation,
};
