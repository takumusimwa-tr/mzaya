/**
 * MZAYA order socket channel registration.
 */
const { rooms } = require('./rooms');
const { canJoinOrder, canJoinVendor, canJoinCity } = require('./roomAuthorization');
const { logger } = require('../utils/logger');

function registerAuthorizedJoin({
  socket,
  event,
  leaveEvent,
  roomType,
  roomBuilder,
  authorize,
}) {
  socket.on(event, async (id, acknowledge = () => {}) => {
    try {
      const allowed = await authorize(socket.user, id);
      if (!allowed) {
        logger.warn('socket_room_denied', {
          userId: socket.user?.id,
          role: socket.user?.role,
          roomType,
          roomId: id,
        });
        acknowledge({ ok: false, error: 'Access denied' });
        return socket.emit('room:denied', { room: roomType, id });
      }

      await socket.join(roomBuilder(id));
      acknowledge({ ok: true, room: roomType, id });
    } catch (error) {
      logger.error('socket_room_join_error', {
        userId: socket.user?.id,
        roomType,
        roomId: id,
        error: error.message,
      });
      acknowledge({ ok: false, error: 'Unable to join room' });
    }
  });

  socket.on(leaveEvent, async (id, acknowledge = () => {}) => {
    if (id) await socket.leave(roomBuilder(id));
    acknowledge({ ok: true });
  });
}

function registerOrderSocket(io, socket) {
  registerAuthorizedJoin({
    socket,
    event: 'join:order',
    leaveEvent: 'leave:order',
    roomType: 'order',
    roomBuilder: rooms.order,
    authorize: canJoinOrder,
  });

  registerAuthorizedJoin({
    socket,
    event: 'join:vendor',
    leaveEvent: 'leave:vendor',
    roomType: 'vendor',
    roomBuilder: rooms.vendor,
    authorize: canJoinVendor,
  });

  registerAuthorizedJoin({
    socket,
    event: 'join:city',
    leaveEvent: 'leave:city',
    roomType: 'city',
    roomBuilder: rooms.city,
    authorize: canJoinCity,
  });

  socket.on('ping:realtime', (acknowledge = () => {}) => {
    acknowledge({
      ok: true,
      socketId: socket.id,
      serverTime: new Date().toISOString(),
    });
  });
}

module.exports = { registerOrderSocket, registerAuthorizedJoin };
