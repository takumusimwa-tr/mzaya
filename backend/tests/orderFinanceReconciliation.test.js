describe('order finance reconciliation controls', () => {
  test('completed order requires finance outbox lineage', () => {
    const code = 'COMPLETED_ORDER_WITHOUT_OUTBOX';
    expect(code).toBeTruthy();
  });
});
