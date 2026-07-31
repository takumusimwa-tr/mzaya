/**
 * Money values are stored as integer minor units to avoid floating-point
 * rounding errors. USD 12.34 is stored as 1234.
 */
function toMinorUnits(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    const error = new Error('Invalid monetary amount');
    error.code = 'INVALID_MONEY_AMOUNT';
    throw error;
  }

  return Math.round(number * (10 ** decimals));
}

function fromMinorUnits(value, decimals = 2) {
  const amount = Number(value);

  if (!Number.isSafeInteger(amount)) {
    const error = new Error('Invalid minor-unit amount');
    error.code = 'INVALID_MINOR_AMOUNT';
    throw error;
  }

  return amount / (10 ** decimals);
}

function assertPositiveMinorUnits(value) {
  const amount = Number(value);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    const error = new Error('Amount must be a positive integer in minor units');
    error.code = 'INVALID_MINOR_AMOUNT';
    throw error;
  }

  return amount;
}

module.exports = {
  toMinorUnits,
  fromMinorUnits,
  assertPositiveMinorUnits,
};
