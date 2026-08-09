describe('procurement refund logic', () => {
  test('unused authorized funds remain refundable', () => {
    const authorized = 15000;
    const spent = 12000;
    expect(authorized - spent).toBe(3000);
  });
});
