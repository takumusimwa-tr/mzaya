function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenSimilarity(left, right) {
  const a = new Set(normalizeText(left).split(' ').filter(Boolean));
  const b = new Set(normalizeText(right).split(' ').filter(Boolean));

  if (!a.size || !b.size) return 0;

  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function dateScore(bankDate, ledgerDate, toleranceDays = 5) {
  const difference = Math.abs(
    new Date(bankDate).getTime() - new Date(ledgerDate).getTime()
  ) / (24 * 60 * 60 * 1000);

  if (difference > toleranceDays) return 0;
  return 1 - (difference / (toleranceDays + 1));
}

function scoreReconciliationCandidate({
  bankTransaction,
  ledgerTransaction,
  ledgerAmountMinor,
}) {
  const bankAmount = Number(bankTransaction.amount_minor);
  const ledgerAmount = Number(ledgerAmountMinor);

  const amountDifference = Math.abs(bankAmount - ledgerAmount);
  const amountScore = bankAmount > 0
    ? Math.max(0, 1 - (amountDifference / bankAmount))
    : 0;

  const referenceScore = Math.max(
    tokenSimilarity(bankTransaction.provider_reference, ledgerTransaction.reference),
    tokenSimilarity(bankTransaction.counterparty_reference, ledgerTransaction.reference)
  );

  const descriptionScore = tokenSimilarity(
    bankTransaction.description,
    ledgerTransaction.description
  );

  const transactionDate = ledgerTransaction.occurred_at || ledgerTransaction.created_at;
  const matchedDateScore = dateScore(
    bankTransaction.transaction_date,
    transactionDate
  );

  const score =
    amountScore * 0.55 +
    matchedDateScore * 0.2 +
    referenceScore * 0.15 +
    descriptionScore * 0.1;

  return {
    score: Number(score.toFixed(4)),
    amountScore: Number(amountScore.toFixed(4)),
    dateScore: Number(matchedDateScore.toFixed(4)),
    referenceScore: Number(referenceScore.toFixed(4)),
    descriptionScore: Number(descriptionScore.toFixed(4)),
  };
}

module.exports = {
  normalizeText,
  tokenSimilarity,
  dateScore,
  scoreReconciliationCandidate,
};
