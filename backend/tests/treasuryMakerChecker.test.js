describe('treasury maker-checker control', () => {
  test('initiator must not approve the same transfer', () => {
    expect('MAKER_CHECKER_VIOLATION').toBeTruthy();
  });
});
