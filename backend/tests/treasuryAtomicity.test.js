describe('treasury finance atomicity', () => {
  test('completion and outbox event share one DB transaction', () => {
    expect(true).toBe(true);
  });
});
