const { WithholdingTaxRecord } = require('../models/associations');
const { calculateTaxMinor } = require('./taxCalculation.service');

async function calculateAndRecordWithholding({
  jurisdictionId,
  payeeType,
  payeeId,
  sourceType,
  sourceId = null,
  grossMinor,
  rateBasisPoints,
  currency,
  metadata = {},
}) {
  const withheldMinor = calculateTaxMinor({
    taxableMinor: grossMinor,
    rateBasisPoints,
  });

  return WithholdingTaxRecord.create({
    jurisdiction_id: jurisdictionId,
    payee_type: payeeType,
    payee_id: payeeId,
    source_type: sourceType,
    source_id: sourceId,
    gross_minor: grossMinor,
    rate_basis_points: rateBasisPoints,
    withheld_minor: withheldMinor,
    currency: String(currency).toUpperCase(),
    metadata,
  });
}

module.exports = { calculateAndRecordWithholding };
