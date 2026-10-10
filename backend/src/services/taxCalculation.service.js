function validateTaxInputs(taxableBaseMinor, taxRateBps) {
  const base = Number(taxableBaseMinor);
  const rate = Number(taxRateBps);

  if (!Number.isFinite(base) || base < 0) {
    const error = new Error('Taxable base must be a non-negative number');
    error.status = 422;
    error.code = 'INVALID_TAXABLE_BASE';
    throw error;
  }

  if (!Number.isFinite(rate) || rate < 0) {
    const error = new Error('Tax rate must be a non-negative basis-point value');
    error.status = 422;
    error.code = 'INVALID_TAX_RATE';
    throw error;
  }

  return { base, rate };
}

function calculateTax({
  taxableBaseMinor,
  taxRateBps,
  taxInclusive = false,
}) {
  const { base, rate } = validateTaxInputs(
    taxableBaseMinor,
    taxRateBps
  );

  if (taxInclusive) {
    const taxAmountMinor = Math.round(
      base - (base / (1 + rate / 10000))
    );

    return {
      taxableBaseMinor: base,
      taxRateBps: rate,
      taxInclusive: true,
      taxAmountMinor,
      netOfTaxMinor: base - taxAmountMinor,
    };
  }

  const taxAmountMinor = Math.round(
    base * rate / 10000
  );

  return {
    taxableBaseMinor: base,
    taxRateBps: rate,
    taxInclusive: false,
    taxAmountMinor,
    netOfTaxMinor: base,
  };
}

function calculateTaxMinor({
  taxableMinor,
  rateBasisPoints,
}) {
  return calculateTax({
    taxableBaseMinor: taxableMinor,
    taxRateBps: rateBasisPoints,
    taxInclusive: false,
  }).taxAmountMinor;
}

module.exports = {
  calculateTax,
  calculateTaxMinor,
};
