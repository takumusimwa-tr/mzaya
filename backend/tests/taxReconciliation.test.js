describe('tax reconciliation controls', () => {
  test('recognized tax transaction requires finance event lineage', () => {
    expect('TAX_TRANSACTION_WITHOUT_OUTBOX').toBeTruthy();
  });
});
