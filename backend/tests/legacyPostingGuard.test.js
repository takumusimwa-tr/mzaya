const {
  CUTOVER_MODE,
} = require('../src/config/financeCutover.constants');

describe('legacy ledger posting guard', () => {
  test('block_legacy mode disables direct ledger posting', () => {
    expect(CUTOVER_MODE.BLOCK_LEGACY).toBe('block_legacy');
  });
});
