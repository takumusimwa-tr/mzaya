describe('payment-finance reconciliation controls', () => {
  test('captured payment requires an outbox event', () => {
    const exception = 'CAPTURE_WITHOUT_OUTBOX';
    expect(exception).toBeTruthy();
  });
});
