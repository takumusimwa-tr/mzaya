/**
 * Batch 08.5.7 example:
 * derive tax facts from an authoritative completed order event.
 *
 * Do not hard-code Zimbabwe tax rates here. Resolve taxCode/taxRateBps from
 * governed tax master data or an approved tax engine.
 */
const {
  createTaxTransaction,
} = require('../taxTransaction.service');

async function createOrderTax({
  order,
  taxCode,
  taxType,
  jurisdictionCode,
  taxRateBps,
}) {
  return createTaxTransaction({
    sourceType: 'order',
    sourceId: order.id,
    sourceEventType: 'order.completed',
    jurisdictionCode,
    taxCode,
    taxType,
    currency: order.currency,
    taxableBaseMinor: Number(
      order.taxable_base_minor ??
      order.subtotal_minor ??
      order.subtotal ??
      0
    ),
    taxRateBps,
    taxInclusive: Boolean(order.tax_inclusive),
    direction: 'payable',
  });
}

module.exports = {
  createOrderTax,
};
