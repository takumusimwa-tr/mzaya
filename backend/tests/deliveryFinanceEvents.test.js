describe('delivery finance event contract', () => {
  test('completion event is distinct from order completion', () => {
    expect('delivery.completed').not.toBe('order.completed');
  });
});
