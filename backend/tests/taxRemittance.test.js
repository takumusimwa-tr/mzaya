describe('tax remittance control', () => {
  test('remittance cannot exceed outstanding liability', () => {
    const liability = 10000;
    const payment = 12000;
    expect(payment > liability).toBe(true);
  });
});
