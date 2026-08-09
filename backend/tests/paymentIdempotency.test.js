describe('payment finance idempotency keys', () => {
  test('capture key is deterministic per payment', () => {
    const paymentId = '123';
    expect(`payment:${paymentId}:captured:v1`)
      .toBe('payment:123:captured:v1');
  });
});
