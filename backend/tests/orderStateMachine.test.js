const { USER_ROLE } = require('../src/config/constants');
const { ORDER_STATUS } = require('../src/constants/orderStatus');
const {
  assertTransitionAllowed,
  availableTransitions,
  transitionTimestampPatch,
} = require('../src/services/orderStateMachine.service');

describe('order state machine', () => {
  test.each([
    [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, USER_ROLE.VENDOR],
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, USER_ROLE.VENDOR],
    [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, USER_ROLE.VENDOR],
    [ORDER_STATUS.READY, ORDER_STATUS.ACCEPTED, USER_ROLE.RIDER],
    [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PICKED_UP, USER_ROLE.RIDER],
    [ORDER_STATUS.PICKED_UP, ORDER_STATUS.EN_ROUTE, USER_ROLE.RIDER],
    [ORDER_STATUS.EN_ROUTE, ORDER_STATUS.DELIVERED, USER_ROLE.RIDER],
  ])('allows %s -> %s for %s', (from, to, role) => {
    expect(assertTransitionAllowed({ from, to, role })).toBe(true);
  });

  test.each([
    [ORDER_STATUS.PENDING, ORDER_STATUS.DELIVERED, USER_ROLE.RIDER],
    [ORDER_STATUS.PREPARING, ORDER_STATUS.PICKED_UP, USER_ROLE.RIDER],
    [ORDER_STATUS.DELIVERED, ORDER_STATUS.EN_ROUTE, USER_ROLE.ADMIN],
    [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, USER_ROLE.CUSTOMER],
  ])('rejects %s -> %s for %s', (from, to, role) => {
    expect(() => assertTransitionAllowed({ from, to, role })).toThrow();
  });

  test('exposes only direct next states', () => {
    expect(availableTransitions(ORDER_STATUS.PREPARING)).toEqual([
      ORDER_STATUS.READY,
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.FAILED,
    ]);
  });

  test('creates lifecycle timestamps', () => {
    const at = new Date('2026-07-30T16:00:00.000Z');
    expect(transitionTimestampPatch(ORDER_STATUS.PICKED_UP, at)).toEqual({ picked_up_at: at });
  });
});
