const {
  createTicketSchema,
  updateTicketSchema,
  internalNoteSchema,
} = require('../src/validators/support.validator');

describe('support validation', () => {
  test('accepts an urgent delivery ticket', () => {
    const result = createTicketSchema.validate({
      subject: 'Mzaya has not arrived',
      category: 'delivery',
      priority: 'urgent',
      body: 'The delivery window has already passed.',
    });

    expect(result.error).toBeUndefined();
  });

  test('accepts ticket resolution changes', () => {
    const result = updateTicketSchema.validate({
      status: 'resolved',
      resolutionSummary: 'Refund issued and customer notified.',
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects empty internal notes', () => {
    const result = internalNoteSchema.validate({ body: '' });
    expect(result.error).toBeDefined();
  });
});
