const crypto = require('crypto');
const {
  TaxLiability,
  TaxTransaction,
} = require('../models/associations');

async function refreshTaxLiability({
  jurisdictionCode = null,
  taxCode,
  taxType,
  periodKey,
  currency,
}) {
  const transactions = await TaxTransaction.findAll({
    where: {
      jurisdiction_code: jurisdictionCode,
      tax_code: taxCode,
      tax_type: taxType,
      currency,
      status: 'recognized',
    },
  });

  const taxAccruedMinor = transactions.reduce(
    (sum, item) => sum + Number(item.tax_amount_minor || 0),
    0
  );

  const [liability] = await TaxLiability.findOrCreate({
    where: {
      jurisdiction_code: jurisdictionCode,
      tax_code: taxCode,
      tax_type: taxType,
      period_key: periodKey,
      currency,
    },
    defaults: {
      liability_reference:
        `TLB-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      opening_balance_minor: 0,
      tax_accrued_minor: taxAccruedMinor,
      adjustments_minor: 0,
      tax_paid_minor: 0,
      closing_balance_minor: taxAccruedMinor,
      status: 'open',
    },
  });

  const closingBalanceMinor =
    Number(liability.opening_balance_minor || 0) +
    taxAccruedMinor +
    Number(liability.adjustments_minor || 0) -
    Number(liability.tax_paid_minor || 0);

  await liability.update({
    tax_accrued_minor: taxAccruedMinor,
    closing_balance_minor: Math.max(0, closingBalanceMinor),
  });

  return liability;
}

module.exports = {
  refreshTaxLiability,
};
