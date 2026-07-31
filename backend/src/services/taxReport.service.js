const { Op } = require('sequelize');
const { TaxInvoice } = require('../models/associations');

async function getTaxSummary({
  jurisdictionId,
  startDate,
  endDate,
}) {
  const where = {
    jurisdiction_id: jurisdictionId,
    status: 'issued',
    issued_at: {
      [Op.between]: [
        new Date(`${startDate}T00:00:00.000Z`),
        new Date(`${endDate}T23:59:59.999Z`),
      ],
    },
  };

  const [subtotalMinor, taxMinor, totalMinor, invoiceCount] = await Promise.all([
    TaxInvoice.sum('subtotal_minor', { where }),
    TaxInvoice.sum('tax_minor', { where }),
    TaxInvoice.sum('total_minor', { where }),
    TaxInvoice.count({ where }),
  ]);

  return {
    jurisdictionId,
    startDate,
    endDate,
    subtotalMinor: Number(subtotalMinor || 0),
    taxMinor: Number(taxMinor || 0),
    totalMinor: Number(totalMinor || 0),
    invoiceCount,
  };
}

module.exports = { getTaxSummary };
