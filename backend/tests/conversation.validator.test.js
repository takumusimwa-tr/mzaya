const {
  createConversationSchema,
  createMessageSchema,
} = require('../src/validators/conversation.validator');

describe('conversation validation', () => {
  test('accepts an order conversation', () => {
    const result = createConversationSchema.validate({
      type: 'order',
      orderId: '11111111-1111-4111-8111-111111111111',
      participants: [{
        userId: '22222222-2222-4222-8222-222222222222',
        role: 'rider',
      }],
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects conversations without participants', () => {
    const result = createConversationSchema.validate({
      type: 'direct',
      participants: [],
    });

    expect(result.error).toBeDefined();
  });

  test('accepts idempotent client message ids', () => {
    const result = createMessageSchema.validate({
      clientMessageId: 'local-123',
      type: 'text',
      body: 'I am outside.',
    });

    expect(result.error).toBeUndefined();
  });
});
