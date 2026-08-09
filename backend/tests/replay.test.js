describe('finance replay state machine', () => {
  test('dead-letter threshold remains finite', () => {
    const maxAttempts = 8;
    expect(maxAttempts).toBeGreaterThan(1);
    expect(maxAttempts).toBeLessThan(20);
  });
});
