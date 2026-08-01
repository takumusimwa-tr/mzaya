const crypto = require('crypto');
const { BankAccount, TreasuryTransfer } = require('../models/associations');
const { getLatestFxRate, convertMinorUnits } = require('./fxRate.service');

async function createTreasuryTransfer({
  fromBankAccountId,
  toBankAccountId,
  sourceAmountMinor,
  requestedBy,
  transferType = 'internal',
}) {
  const [fromAccount, toAccount] = await Promise.all([
    BankAccount.findByPk(fromBankAccountId),
    BankAccount.findByPk(toBankAccountId),
  ]);

  if (!fromAccount || !toAccount) {
    const error = new Error('Treasury bank account not found');
    error.status = 404;
    throw error;
  }

  if (String(fromAccount.id) === String(toAccount.id)) {
    const error = new Error('Source and destination accounts must differ');
    error.status = 422;
    throw error;
  }

  if (Number(fromAccount.available_balance_minor) < Number(sourceAmountMinor)) {
    const error = new Error('Insufficient available balance');
    error.status = 409;
    error.code = 'INSUFFICIENT_TREASURY_BALANCE';
    throw error;
  }

  const fxRate = await getLatestFxRate({
    baseCurrency: fromAccount.currency,
    quoteCurrency: toAccount.currency,
  });

  if (!fxRate) {
    const error = new Error('FX rate not available for transfer');
    error.status = 409;
    throw error;
  }

  const destinationAmountMinor = convertMinorUnits({
    amountMinor: sourceAmountMinor,
    rate: fxRate.rate,
  });

  return TreasuryTransfer.create({
    transfer_reference: `TR-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    from_bank_account_id: fromAccount.id,
    to_bank_account_id: toAccount.id,
    source_currency: fromAccount.currency,
    destination_currency: toAccount.currency,
    source_amount_minor: sourceAmountMinor,
    destination_amount_minor: destinationAmountMinor,
    fx_rate_id: fxRate.id,
    transfer_type: transferType,
    requested_by: requestedBy,
    status: 'draft',
  });
}

module.exports = {
  createTreasuryTransfer,
};
