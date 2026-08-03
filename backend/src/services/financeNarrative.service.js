function formatPercentage(value) {
  if (value == null) return 'not available';
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function generateExecutiveNarrative(summary) {
  const totals = summary.totals;
  const liquidity = summary.liquidity;

  const sentences = [
    `The period recorded ${totals.orderCount} completed orders.`,
    `Recognized platform revenue was ${summary.period.currency} ${(totals.revenueMinor / 100).toFixed(2)}.`,
    `Contribution margin was ${formatPercentage(totals.contributionMarginRatio)}, while net margin was ${formatPercentage(totals.netMarginRatio)}.`,
  ];

  if (liquidity) {
    sentences.push(
      `Available cash closed at ${summary.period.currency} ${(Number(liquidity.available_cash_minor || 0) / 100).toFixed(2)}.`
    );
  }

  if (summary.treasuryAlerts?.length) {
    sentences.push(
      `${summary.treasuryAlerts.length} treasury risk alert${summary.treasuryAlerts.length === 1 ? '' : 's'} remained open.`
    );
  }

  return sentences.join(' ');
}

module.exports = {
  formatPercentage,
  generateExecutiveNarrative,
};
