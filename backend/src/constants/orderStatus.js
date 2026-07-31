/**
 * MZAYA authoritative order lifecycle vocabulary.
 * Keep all status comparisons and transition rules centralized here.
 */
const ORDER_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  RIDER_ASSIGNED: 'rider_assigned',
  ACCEPTED: 'accepted', // legacy rider-claim state retained for compatibility
  PICKED_UP: 'picked_up',
  EN_ROUTE: 'en_route',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

const TERMINAL_STATUSES = Object.freeze([
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.FAILED,
]);

module.exports = { ORDER_STATUS, TERMINAL_STATUSES };
