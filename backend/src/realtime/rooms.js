/**
 * MZAYA real-time room naming.
 * Keep every socket room key in one place to prevent mismatched subscriptions.
 */
const rooms = Object.freeze({
  user: (userId) => `user:${userId}`,
  order: (orderId) => `order:${orderId}`,
  vendor: (vendorId) => `vendor:${vendorId}`,
  city: (cityId) => `city:${cityId}`,
  admins: () => 'admins',
});

module.exports = { rooms };
