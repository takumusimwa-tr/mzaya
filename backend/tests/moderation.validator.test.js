const {
  createReportSchema,
  resolveReportSchema,
  applyActionSchema,
} = require('../src/validators/moderation.validator');

describe('communication moderation validation', () => {
  test('accepts a harassment report', () => {
    expect(createReportSchema.validate({
      reason: 'harassment',
      details: 'Repeated threatening messages.',
    }).error).toBeUndefined();
  });

  test('accepts message removal resolution', () => {
    expect(resolveReportSchema.validate({
      status: 'resolved',
      resolution: 'message_removed',
    }).error).toBeUndefined();
  });

  test('requires a moderation action', () => {
    expect(applyActionSchema.validate({
      reason: 'Unsafe content',
    }).error).toBeDefined();
  });
});
