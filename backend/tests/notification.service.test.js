const {
  normalizeChannels,
} = require('../src/services/notification.service');

describe('notification service helpers', () => {
  test('deduplicates supported channels', () => {
    expect(normalizeChannels(['in_app', 'email', 'email'])).toEqual([
      'in_app',
      'email',
    ]);
  });

  test('removes unsupported channels', () => {
    expect(normalizeChannels(['push', 'carrier_pigeon'])).toEqual(['push']);
  });

  test('defaults to in-app delivery', () => {
    expect(normalizeChannels()).toEqual(['in_app']);
  });
});
