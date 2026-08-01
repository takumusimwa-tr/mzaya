const crypto = require('crypto');

function parserError(message, rowNumber = null) {
  const error = new Error(message);
  error.code = 'BANK_STATEMENT_PARSE_ERROR';
  error.rowNumber = rowNumber;
  return error;
}

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw parserError(`Invalid transaction date: ${value}`);
  }
  return date.toISOString().slice(0, 10);
}

function parseMinorUnits(value) {
  const normalized = String(value ?? '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount === 0) {
    throw parserError(`Invalid transaction amount: ${value}`);
  }

  return Math.round(Math.abs(amount) * 100);
}

function normalizeStatementRow(row, rowNumber) {
  const amountValue = row.amount ?? row.Amount ?? row.transaction_amount;
  const amountMinor = parseMinorUnits(amountValue);

  const explicitDirection = String(
    row.direction ?? row.Direction ?? ''
  ).toLowerCase();

  const numericAmount = Number(
    String(amountValue).replace(/,/g, '').replace(/[^\d.-]/g, '')
  );

  const direction = ['debit', 'credit'].includes(explicitDirection)
    ? explicitDirection
    : numericAmount < 0 ? 'debit' : 'credit';

  const transactionDate = parseDate(
    row.transaction_date ??
    row.date ??
    row.Date
  );

  const providerReference = String(
    row.reference ??
    row.transaction_reference ??
    row.id ??
    crypto
      .createHash('sha256')
      .update(JSON.stringify(row))
      .digest('hex')
  ).slice(0, 180);

  return {
    providerReference,
    transactionDate,
    valueDate: row.value_date ? parseDate(row.value_date) : null,
    direction,
    amountMinor,
    description: String(row.description ?? row.narration ?? '').slice(0, 500),
    counterpartyName: String(row.counterparty ?? row.payee ?? '').slice(0, 180),
    counterpartyReference: String(row.counterparty_reference ?? '').slice(0, 180),
    runningBalanceMinor: row.balance != null
      ? Math.round(Number(String(row.balance).replace(/,/g, '')) * 100)
      : null,
    rowNumber,
  };
}

module.exports = {
  parseDate,
  parseMinorUnits,
  normalizeStatementRow,
};
