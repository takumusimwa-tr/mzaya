/**
 * MZAYA real-time server.
 * One authenticated Socket.IO instance attached to the HTTP server.
 */
const { Server } = require('socket.io');
const { socketAuth } = require('./socketAuth');
const { rooms } = require('./rooms');
const { registerOrderSocket } = require('./order.socket');
const { setOrderPublisherIO } = require('./orderPublisher');
const { startOrderEventBridge, stopOrderEventBridge } = require('./orderEventBridge');
const { logger } = require('../utils/logger');

let io = null;

function socketOrigins() {
  const configured = (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length) return configured;
  if (process.env.NODE_ENV === 'production') return [];
  return ['http://localhost:5173'];
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: socketOrigins(),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { id, role } = socket.user || {};
    if (!id) return socket.disconnect(true);

    socket.join(rooms.user(id));
    if (role === 'admin') socket.join(rooms.admins());

    registerOrderSocket(io, socket);

    logger.info('socket_connected', {
      socketId: socket.id,
      userId: id,
      role,
    });

    socket.on('disconnect', (reason) => {
      logger.info('socket_disconnected', {
        socketId: socket.id,
        userId: id,
        reason,
      });
    });
  });

  setOrderPublisherIO(io);
  startOrderEventBridge();
  logger.info('socket_ready');

  return io;
}

async function closeSocket() {
  stopOrderEventBridge();
  if (!io) return;
  await new Promise((resolve) => io.close(resolve));
  io = null;
}

module.exports = {
  initSocket,
  closeSocket,
  getIO: () => io,
};
