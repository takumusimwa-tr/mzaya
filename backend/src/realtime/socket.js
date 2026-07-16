// backend/src/realtime/socket.js
// Real-time layer. One Socket.IO server attached to the HTTP server.
// Clients authenticate with their JWT on handshake and join rooms by identity
// and role. Controllers call the exported emit helpers to push updates.
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Room name helpers — keep names consistent across the app.
const rooms = {
  user:   (id) => `user:${id}`,
  vendor: (id) => `vendor:${id}`,
  city:   (id) => `city:${id}`,
  admins: () => 'admins',
};

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(','),
      credentials: true,
    },
  });

  // Authenticate every socket via the JWT passed in handshake.auth.token.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload; // { id, role, ... }
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user || {};
    if (!id) return socket.disconnect(true);

    // Everyone joins their personal room.
    socket.join(rooms.user(id));
    // Admins watch the platform.
    if (role === 'admin') socket.join(rooms.admins());

    // ── Room joins are AUTHORIZED, not trusted ──────────────────────────────
    //
    // These used to accept whatever id the client sent. A signed-in customer
    // could emit join:vendor with any branch id and start receiving that
    // business's live order feed — names, addresses, totals. A straight data
    // leak, exploitable from the browser console.
    //
    // Now every join is checked against the database: you may only enter a room
    // you actually own or belong to.

    socket.on('join:vendor', async (vendorId) => {
      if (!vendorId) return;
      const ok = await canJoinVendor(socket.user, vendorId);
      if (!ok) {
        console.warn(`[socket] refused vendor room ${vendorId} for user ${id} (${role})`);
        return socket.emit('room:denied', { room: 'vendor', id: vendorId });
      }
      socket.join(rooms.vendor(vendorId));
    });

    socket.on('leave:vendor', (vendorId) => vendorId && socket.leave(rooms.vendor(vendorId)));

    socket.on('join:city', async (cityId) => {
      if (!cityId) return;
      const ok = await canJoinCity(socket.user, cityId);
      if (!ok) {
        console.warn(`[socket] refused city room ${cityId} for user ${id} (${role})`);
        return socket.emit('room:denied', { room: 'city', id: cityId });
      }
      socket.join(rooms.city(cityId));
    });

    socket.on('leave:city',  (cityId) => cityId && socket.leave(rooms.city(cityId)));

    socket.on('disconnect', () => { /* rooms auto-cleaned */ });
  });

  console.log('⚡ Socket.IO ready');
  return io;
}

// ─── Room authorization ───────────────────────────────────────────────────────
// Never trust an id supplied over the socket. Check ownership in the database.

// A vendor room may be joined only by the OWNER of that branch's brand (or an
// admin). Not by a customer, not by a rider, not by a different vendor.
async function canJoinVendor(user, vendorId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'vendor') return false;

  try {
    const { Vendor } = require('../models/associations');
    const branch = await Vendor.findByPk(vendorId, { attributes: ['owner_id'], raw: true });
    return !!branch && branch.owner_id === user.id;
  } catch (err) {
    console.error('[socket] canJoinVendor failed:', err.message);
    return false;   // fail closed
  }
}

// A city room carries the available-jobs feed. Only a rider registered to THAT
// city (or an admin) may listen to it.
async function canJoinCity(user, cityId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'rider') return false;

  try {
    const { Rider } = require('../models/associations');
    const rider = await Rider.findOne({
      where: { user_id: user.id },
      attributes: ['city_id'],
      raw: true,
    });
    return !!rider && String(rider.city_id) === String(cityId);
  } catch (err) {
    console.error('[socket] canJoinCity failed:', err.message);
    return false;   // fail closed
  }
}

// ─── Emit helpers (called from controllers/services) ──────────────────────────

// A new order was placed → tell the vendor branch and riders in that city.
function emitOrderNew(order) {
  if (!io) return;
  const vendorId = order.vendor_id || order._vendorId;
  if (vendorId) io.to(rooms.vendor(vendorId)).emit('order:new', { orderId: order.id });
  if (order.city_id) io.to(rooms.city(order.city_id)).emit('order:new', { orderId: order.id });
  io.to(rooms.admins()).emit('order:new', { orderId: order.id });
}

// An order changed status → notify the customer, the vendor, and admins.
function emitOrderUpdated(order, extra = {}) {
  if (!io) return;
  const payload = { orderId: order.id, status: order.status, ...extra };
  if (order.customer_id) io.to(rooms.user(order.customer_id)).emit('order:updated', payload);
  const vendorId = order.vendor_id || extra.vendorId;
  if (vendorId) io.to(rooms.vendor(vendorId)).emit('order:updated', payload);
  io.to(rooms.admins()).emit('order:updated', payload);
}

// An order was assigned to a specific rider.
function emitOrderAssigned(riderUserId, order) {
  if (!io) return;
  io.to(rooms.user(riderUserId)).emit('order:assigned', { orderId: order.id });
}

// Live rider GPS → the customer tracking this order.
function emitRiderLocation(customerId, location) {
  if (!io) return;
  io.to(rooms.user(customerId)).emit('rider:location', location);
}

module.exports = {
  initSocket,
  emitOrderNew,
  emitOrderUpdated,
  emitOrderAssigned,
  emitRiderLocation,
  getIO: () => io,
};
