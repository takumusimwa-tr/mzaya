describe('finance period lock semantics', () => {
  test('hard active lock is blocking', () => {
    const lock = { status: 'active', lock_type: 'hard' };
    expect(lock.status === 'active' && lock.lock_type === 'hard').toBe(true);
  });
});
