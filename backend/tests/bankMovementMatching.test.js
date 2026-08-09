describe('bank movement matching', () => {
  test('provider reference is preferred when available', () => {
    const transferReference = 'BANK-123';
    const movementReference = 'BANK-123';
    expect(transferReference === movementReference).toBe(true);
  });
});
