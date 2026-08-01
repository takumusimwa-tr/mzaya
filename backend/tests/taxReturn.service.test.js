const {
  buildReturnReference,
} = require('../src/services/taxReturn.service');

describe('tax return references', () => {
  test('includes the filing period code', () => {
    expect(buildReturnReference('2026-07'))
      .toMatch(/^TAX-2026-07-[A-Z0-9]{8}$/);
  });
});
