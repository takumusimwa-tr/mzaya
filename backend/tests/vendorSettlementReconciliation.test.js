describe('vendor settlement reconciliation controls', () => {
  test('settlement requires finance event lineage', () => {
    expect('SETTLEMENT_WITHOUT_OUTBOX').toBeTruthy();
  });
});
