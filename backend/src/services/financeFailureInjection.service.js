function shouldFail(point) {
  // Read at invocation time so controlled test/staging toggles can be enabled
  // after process startup without reloading this module.
  const enabled =
    process.env.FINANCE_FAILURE_INJECTION === 'true';

  if (!enabled) return false;

  const requested = String(
    process.env.FINANCE_FAILURE_POINT || ''
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return requested.includes(point);
}

function failIfRequested(point) {
  if (!shouldFail(point)) return;

  const error = new Error(
    `Injected finance failure at ${point}`
  );
  error.code = 'FINANCE_FAILURE_INJECTED';
  error.failurePoint = point;
  throw error;
}

module.exports = {
  shouldFail,
  failIfRequested,
};
