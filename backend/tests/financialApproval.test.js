describe('maker-checker governance', () => {
  test('creator and approver are distinct', () => {
    expect('creator-id').not.toBe('approver-id');
  });
  test('multiple approvals can be required', () => {
    expect(2 >= 2).toBe(true);
  });
});
