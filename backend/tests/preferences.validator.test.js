const {
  updatePreferencesSchema,
} = require('../src/validators/preferences.validator');

describe('notification preference validation', () => {
  test('accepts supported categories and channels', () => {
    const result = updatePreferencesSchema.validate({
      preferences: {
        order: {
          in_app: true,
          push: true,
          email: false,
          sms: false,
        },
      },
    });

    expect(result.error).toBeUndefined();
  });

  test('rejects unknown categories', () => {
    const result = updatePreferencesSchema.validate({
      preferences: {
        random: {
          push: true,
        },
      },
    });

    expect(result.error).toBeDefined();
  });
});
