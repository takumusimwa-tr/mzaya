const { rooms } = require('../src/realtime/rooms');
const {
  compactOrderPayload,
  setOrderPublisherIO,
  publishOrderStatusChanged,
} = require('../src/realtime/orderPublisher');

describe('real-time rooms', () => {
  test('creates stable room keys', () => {
    expect(rooms.user('u1')).toBe('user:u1');
    expect(rooms.order('o1')).toBe('order:o1');
    expect(rooms.vendor('v1')).toBe('vendor:v1');
    expect(rooms.city('c1')).toBe('city:c1');
    expect(rooms.admins()).toBe('admins');
  });
});

describe('order publisher', () => {
  test('creates a compact stable payload', () => {
    expect(
      compactOrderPayload({
        id: 'o1',
        status: 'preparing',
        customer_id: 'u1',
        rider_id: null,
        vendor_id: 'v1',
        city_id: 'c1',
        updated_at: '2026-07-30T17:00:00.000Z',
      })
    ).toEqual({
      orderId: 'o1',
      status: 'preparing',
      customerId: 'u1',
      riderId: null,
      vendorId: 'v1',
      cityId: 'c1',
      updatedAt: '2026-07-30T17:00:00.000Z',
    });
  });

  test('publishes to the order, user, vendor and admin rooms', () => {
    const emissions = [];
    const io = {
      to(room) {
        return {
          emit(event, payload) {
            emissions.push({ room, event, payload });
          },
        };
      },
    };

    setOrderPublisherIO(io);
    publishOrderStatusChanged(
      {
        id: 'o1',
        status: 'ready',
        customer_id: 'u1',
        rider_id: 'r1',
        vendor_id: 'v1',
      },
      { fromStatus: 'preparing', changedAt: '2026-07-30T17:00:00.000Z' }
    );

    expect(emissions.map((entry) => entry.room)).toEqual(
      expect.arrayContaining([
        'order:o1',
        'user:u1',
        'user:r1',
        'vendor:v1',
        'admins',
      ])
    );
    expect(emissions.every((entry) => entry.event === 'order:status_changed')).toBe(true);
  });
});
