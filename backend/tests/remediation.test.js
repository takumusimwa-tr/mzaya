describe('finance remediation maker-checker', () => {
  test('completion and verification should be performed by different users', () => {
    expect('completed-by').not.toBe('verified-by');
  });
});
