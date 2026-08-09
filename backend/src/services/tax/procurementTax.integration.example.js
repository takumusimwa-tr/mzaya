const {
  createTaxTransaction,
} = require('../taxTransaction.service');

async function createProcurementTax({
  procurement,
  taxCode,
  taxType,
  jurisdictionCode,
  taxRateBps,
}) {
  return createTaxTransaction({
    sourceType: 'procurement',
    sourceId: procurement.id,
    sourceEventType: 'procurement.completed',
    jurisdictionCode,
    taxCode,
    taxType,
    currency: procurement.currency,
    taxableBaseMinor: Number(procurement.merchandise_cost_minor || 0),
    taxRateBps,
    taxInclusive: false,
    direction: 'payable',
  });
}

module.exports = {
  createProcurementTax,
};
