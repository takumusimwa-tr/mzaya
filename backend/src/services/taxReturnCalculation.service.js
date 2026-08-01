const { Op } = require('sequelize');
const {
  TaxInvoice,
  WithholdingTaxRecord,
} = require('../models/associations');

async function calculateTaxReturnValues({
  jurisdictionId,
  startDate,
  endDate,
}) {
  const range = {
    [Op.between]: [
      new Date(`${startDate}T00:00:00.000Z`),
      new Date(`${endDate}T23:59:59.999Z`),
    ],
  };

  const [
    taxableSalesMinor,
    outputTaxMinor,
    withholdingMinor,
  ] = await Promise.all([
    TaxInvoice.sum('subtotal_minor', {
      where: {
        jurisdiction_id: jurisdictionId,
        status: 'issued',
        issued_at: range,
      },
    }),
    TaxInvoice.sum('tax_minor', {
      where: {
        jurisdiction_id: jurisdictionId,
        status: 'issued',
        issued_at: range,
      },
    }),
    WithholdingTaxRecord.sum('withheld_minor', {
      where: {
        jurisdiction_id: jurisdictionId,
        withheld_at: range,
        status: { [Op.in]: ['calculated', 'remitted'] },
      },
    }),
  ]);

  return {
    taxableSalesMinor: Number(taxableSalesMinor || 0),
    outputTaxMinor: Number(outputTaxMinor || 0),
    inputTaxMinor: 0,
    withholdingMinor: Number(withholdingMinor || 0),
  };
}

module.exports = { calculateTaxReturnValues };
