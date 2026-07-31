const {
  quickReplyCreateSchema,
  quickReplySendSchema,
  ensureConversationSchema,
} = require('../src/validators/vendorChat.validator');

describe('vendor chat validation', () => {
  test('accepts a vendor preparation quick reply', () => {
    const result = quickReplyCreateSchema.validate({
      label: 'Preparing',
      message: 'We are preparing your order now.',
      category: 'preparation',
    });

    expect(result.error).toBeUndefined();
  });

  test('requires conversation id when sending a quick reply', () => {
    const result = quickReplySendSchema.validate({
      clientMessageId: 'quick-1',
    });

    expect(result.error).toBeDefined();
  });

  test('defaults to including the assigned Mzaya', () => {
    const result = ensureConversationSchema.validate({});
    expect(result.value.includeMzaya).toBe(true);
  });
});
