const {
  notificationIdParamsSchema,
  listNotificationsQuerySchema,
} = require('../src/validators/notification.validator');

describe('notification validation', () => {
  test('accepts valid pagination query', () => {
    const result = listNotificationsQuerySchema.validate({
      unread: 'true',
      limit: 25,
      cursor: '2026-07-30T12:00:00.000Z',
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects excessive page size', () => {
    const result = listNotificationsQuerySchema.validate({ limit: 101 });
    expect(result.error).toBeDefined();
  });

  test('requires UUID notification ids', () => {
    const result = notificationIdParamsSchema.validate({
      notificationId: 'not-a-uuid',
    });
    expect(result.error).toBeDefined();
  });
});
