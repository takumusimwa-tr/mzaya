jest.mock('../src/services/notification.service', () => ({
  createNotification: jest.fn(async (payload) => payload),
}));

const {
  createNotification,
} = require('../src/services/notification.service');
const {
  notifyRecipient,
} = require('../src/services/notificationOrchestrator.service');

describe('notification orchestrator', () => {
  beforeEach(() => {
    createNotification.mockClear();
  });

  test('renders and creates a customer notification', async () => {
    const order = {
      id: '12345678-aaaa-bbbb-cccc-123456789012',
      status: 'delivered',
    };

    await notifyRecipient({
      userId: 'customer-1',
      audience: 'customer',
      eventKey: 'order.delivered',
      context: { order },
    });

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-1',
        eventKey: 'order.delivered',
        category: 'order',
        channels: ['in_app'],
      })
    );
  });

  test('ignores unregistered event keys', async () => {
    const result = await notifyRecipient({
      userId: 'customer-1',
      audience: 'customer',
      eventKey: 'missing.event',
      context: {},
    });

    expect(result).toBeNull();
    expect(createNotification).not.toHaveBeenCalled();
  });
});
