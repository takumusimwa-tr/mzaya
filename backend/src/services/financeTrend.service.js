function calculateTrend(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (numeric.length < 2) {
    return {
      direction: 'flat',
      absoluteChange: 0,
      percentageChange: null,
    };
  }

  const first = numeric[0];
  const last = numeric[numeric.length - 1];
  const absoluteChange = last - first;

  return {
    direction: absoluteChange > 0 ? 'up' : absoluteChange < 0 ? 'down' : 'flat',
    absoluteChange,
    percentageChange:
      first === 0 ? null : Number((absoluteChange / Math.abs(first)).toFixed(6)),
  };
}

module.exports = { calculateTrend };
