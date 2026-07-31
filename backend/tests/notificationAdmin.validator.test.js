const {
  listDeliveryQuerySchema,
  deliveryIdParamsSchema,
} = require('../src/validators/notificationAdmin.validator');

describe('notification admin validation', () => {
  test('accepts supported delivery filters', () => {
    const result = listDeliveryQuerySchema.validate({
      status: 'failed',
      channel: 'email',
      limit: 25,
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects unsupported status values', () => {
    const result = listDeliveryQuerySchema.validate({
      status: 'unknown',
    });

    expect(result.error).toBeDefined();
  });

  test('requires a UUID delivery id', () => {
    const result = deliveryIdParamsSchema.validate({
      deliveryId: 'invalid',
    });

    expect(result.error).toBeDefined();
  });
});
