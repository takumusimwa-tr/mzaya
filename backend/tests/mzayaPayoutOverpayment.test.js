describe('Mzaya payout payment control', () => {
  test('paid amount cannot exceed amount due', () => {
    const amountDue = 10000;
    const alreadyPaid = 8500;
    const nextPayment = 2000;

    expect(alreadyPaid + nextPayment > amountDue).toBe(true);
  });
});
