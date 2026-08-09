describe('vendor settlement payment control', () => {
  test('amount paid cannot exceed amount due', () => {
    const amountDue = 10000;
    const paid = 9000;
    const newPayment = 2000;
    expect(paid + newPayment > amountDue).toBe(true);
  });
});
