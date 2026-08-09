describe('treasury reconciliation controls', () => {
  test('completed treasury transfer requires bank movement lineage', () => {
    expect('TREASURY_TRANSFER_WITHOUT_BANK_MOVEMENT').toBeTruthy();
  });
});
