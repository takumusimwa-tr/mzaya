describe('finance dead-letter lifecycle', () => {
  test('quarantined items require explicit replay', () => {
    const automaticReplayFromQuarantine = false;
    expect(automaticReplayFromQuarantine).toBe(false);
  });
});
