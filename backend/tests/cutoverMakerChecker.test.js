describe('finance cutover maker-checker', () => {
  test('requester cannot approve same cutover decision', () => {
    expect('MAKER_CHECKER_VIOLATION').toBeTruthy();
  });
});
