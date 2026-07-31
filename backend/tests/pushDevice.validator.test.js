const {
  registerDeviceSchema,
  deactivateDeviceSchema,
} = require('../src/validators/pushDevice.validator');
const {
  buildMessagePush,
} = require('../src/services/chatPushTemplate.service');

describe('chat push validation', () => {
  test('accepts a web push device', () => {
    const result = registerDeviceSchema.validate({
      platform: 'web',
      pushToken: 'push-token-value',
      locale: 'en-ZW',
      timezone: 'Africa/Harare',
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects unsupported device platforms', () => {
    const result = registerDeviceSchema.validate({
      platform: 'desktop-native',
      pushToken: 'push-token-value',
    });

    expect(result.error).toBeDefined();
  });

  test('requires a token when deactivating', () => {
    const result = deactivateDeviceSchema.validate({});
    expect(result.error).toBeDefined();
  });

  test('builds deep-linked message push payloads', () => {
    const payload = buildMessagePush({
      message: {
        id: 'message-1',
        type: 'text',
        body: 'I am at the entrance.',
      },
      conversation: {
        id: 'conversation-1',
      },
      sender: {
        first_name: 'Tawanda',
        last_name: 'Moyo',
      },
      unreadCount: 3,
    });

    expect(payload.title).toBe('Tawanda Moyo');
    expect(payload.badge).toBe(3);
    expect(payload.data.route).toBe('/messages/conversation-1');
  });
});
