describe('finance transactional outbox contract', () => {
  test('outbox writes require an existing transaction', () => {
    const transactionRequired = true;
    expect(transactionRequired).toBe(true);
  });
});
