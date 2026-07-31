/**
 * MZAYA order state machine.
 * Pure functions live here so transition rules are independently testable.
 */
const { USER_ROLE } = require('../config/constants');
const { ORDER_STATUS, TERMINAL_STATUSES } = require('../constants/orderStatus');

const TRANSITIONS = Object.freeze({
  [ORDER_STATUS.SCHEDULED]: [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.RIDER_ASSIGNED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.RIDER_ASSIGNED]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.EN_ROUTE, ORDER_STATUS.FAILED],
  [ORDER_STATUS.EN_ROUTE]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.FAILED]: [],
});

const ROLE_TRANSITIONS = Object.freeze({
  [USER_ROLE.CUSTOMER]: new Set([ORDER_STATUS.CANCELLED]),
  [USER_ROLE.VENDOR]: new Set([
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.FAILED,
  ]),
  [USER_ROLE.RIDER]: new Set([
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.EN_ROUTE,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.FAILED,
  ]),
  [USER_ROLE.ADMIN]: new Set(Object.values(ORDER_STATUS)),
});

class OrderTransitionError extends Error {
  constructor(message, status = 409, code = 'INVALID_ORDER_TRANSITION') {
    super(message);
    this.name = 'OrderTransitionError';
    this.status = status;
    this.code = code;
  }
}

function availableTransitions(status) {
  return [...(TRANSITIONS[status] || [])];
}

function assertTransitionAllowed({ from, to, role }) {
  if (!TRANSITIONS[from]) {
    throw new OrderTransitionError(`Unknown current order status: ${from}`, 400, 'UNKNOWN_CURRENT_STATUS');
  }
  if (!Object.values(ORDER_STATUS).includes(to)) {
    throw new OrderTransitionError(`Unknown target order status: ${to}`, 400, 'UNKNOWN_TARGET_STATUS');
  }
  if (TERMINAL_STATUSES.includes(from)) {
    throw new OrderTransitionError(`Order is already in terminal state: ${from}`);
  }
  if (!TRANSITIONS[from].includes(to)) {
    throw new OrderTransitionError(`Order cannot move from ${from} to ${to}`);
  }
  const allowedForRole = ROLE_TRANSITIONS[role];
  if (!allowedForRole || !allowedForRole.has(to)) {
    throw new OrderTransitionError(`Role ${role || 'unknown'} cannot move an order to ${to}`, 403, 'ORDER_TRANSITION_FORBIDDEN');
  }
  return true;
}

function transitionTimestampPatch(status, at = new Date()) {
  const patches = {
    [ORDER_STATUS.ACCEPTED]: { accepted_at: at },
    [ORDER_STATUS.PICKED_UP]: { picked_up_at: at },
    [ORDER_STATUS.DELIVERED]: { delivered_at: at },
    [ORDER_STATUS.CANCELLED]: { cancelled_at: at },
  };
  return patches[status] || {};
}

module.exports = {
  TRANSITIONS,
  ROLE_TRANSITIONS,
  OrderTransitionError,
  availableTransitions,
  assertTransitionAllowed,
  transitionTimestampPatch,
};
