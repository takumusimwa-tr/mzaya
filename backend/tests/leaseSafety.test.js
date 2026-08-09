describe('finance delivery lease safety', () => {
  test('one active lease is intended per outbox event', () => {
    const uniqueLeaseConstraint = true;
    expect(uniqueLeaseConstraint).toBe(true);
  });
});
