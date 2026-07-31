/**
 * MZAYA Socket.IO authentication middleware.
 */
const jwt = require('jsonwebtoken');

function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      const error = new Error('Authentication required');
      error.data = { code: 'SOCKET_AUTH_REQUIRED' };
      return next(error);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch (_error) {
    const error = new Error('Invalid or expired token');
    error.data = { code: 'SOCKET_AUTH_INVALID' };
    return next(error);
  }
}

module.exports = { socketAuth };
