function diffObjects(previous = {}, next = {}) {
  const changes = {};
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  for (const key of keys) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) {
      changes[key] = { before: previous[key] ?? null, after: next[key] ?? null };
    }
  }
  return changes;
}
module.exports = { diffObjects };
