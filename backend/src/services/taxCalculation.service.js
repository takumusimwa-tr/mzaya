const { Op } = require('sequelize');
const { TaxRate } = require('../models/associations');

function calculateTaxMinor({
  taxableMinor,
  rateBasisPoints,
}) {
  const amount = Number(taxableMinor);
  const rate = Number(rateBasisPoints);

  if (!Number.isSafeInteger(amount) || amount < 0) {
    const error = new Error('Taxable amount must be a non-negative integer');
    error.code = 'INVALID_TAXABLE_AMOUNT';
    throw error;
  }

  if (!Number.isInteger(rate) || rate < 0) {
    const error = new Error('Tax rate must be a non-negative integer');
    error.code = 'INVALID_TAX_RATE';
    throw error;
  }

  return Math.round((amount * rate) / 10000);
}

async function resolveTaxRate({
  jurisdictionId,
  taxType,
  appliesTo,
  effectiveDate = new Date(),
}) {
  const date = effectiveDate.toISOString().slice(0, 10);

  const rate = await TaxRate.findOne({
    where: {
      jurisdiction_id: jurisdictionId,
      tax_type: taxType,
      applies_to: appliesTo,
      status: 'active',
      effective_from: { [Op.lte]: date },
      [Op.or]: [
        { effective_to: null },
        { effective_to: { [Op.gte]: date } },
      ],
    },
    order: [['effective_from', 'DESC']],
  });

  return rate;
}

async function calculateTax({
  jurisdictionId,
  taxType = 'vat',
  appliesTo = 'platform_fee',
  taxableMinor,
  effectiveDate = new Date(),
}) {
  const rate = await resolveTaxRate({
    jurisdictionId,
    taxType,
    appliesTo,
    effectiveDate,
  });

  if (!rate) {
    return {
      taxMinor: 0,
      rateBasisPoints: 0,
      taxRateId: null,
    };
  }

  return {
    taxMinor: calculateTaxMinor({
      taxableMinor,
      rateBasisPoints: rate.rate_basis_points,
    }),
    rateBasisPoints: rate.rate_basis_points,
    taxRateId: rate.id,
  };
}

module.exports = {
  calculateTaxMinor,
  resolveTaxRate,
  calculateTax,
};
