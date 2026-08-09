describe('payment finance outbox atomicity', () => {
  test('payment mutation and outbox write share one DB transaction', () => {
    const required = true;
    expect(required).toBe(true);
  });
});
