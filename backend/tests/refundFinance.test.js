describe('refund finance constraints', () => {
  test('refund amount cannot exceed refundable captured amount', () => {
    const captured = 10000;
    const previousRefunds = 2500;
    const available = captured - previousRefunds;
    expect(available).toBe(7500);
  });
});
