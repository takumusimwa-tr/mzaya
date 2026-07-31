const {
  renderTemplate,
  hasTemplate,
  shortId,
} = require('../src/services/notificationTemplate.service');

describe('notification templates', () => {
  const order = {
    id: '12345678-aaaa-bbbb-cccc-123456789012',
    status: 'confirmed',
    rider_id: 'rider-1',
    vendor_id: 'vendor-1',
  };

  test('renders an order confirmation', () => {
    const template = renderTemplate('order.confirmed', { order });

    expect(template.title).toBe('Order confirmed');
    expect(template.category).toBe('order');
    expect(template.actionUrl).toBe(`/orders/${order.id}`);
  });

  test('renders dispatch offers with offer metadata', () => {
    const offer = {
      id: 'offer-1',
      expires_at: '2026-07-30T18:00:00.000Z',
      pickup_eta_minutes: 8,
      distance_km: 2.3,
    };

    const template = renderTemplate('dispatch.offer_created', {
      order,
      offer,
    });

    expect(template.priority).toBe('urgent');
    expect(template.data.offerId).toBe('offer-1');
  });

  test('rejects unknown template keys', () => {
    expect(() =>
      renderTemplate('unknown.event', { order })
    ).toThrow('No notification template registered');
  });

  test('reports registered templates', () => {
    expect(hasTemplate('order.delivered')).toBe(true);
    expect(hasTemplate('missing')).toBe(false);
  });

  test('shortens identifiers consistently', () => {
    expect(shortId(order.id)).toBe('12345678');
  });
});
