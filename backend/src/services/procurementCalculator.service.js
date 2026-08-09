function calculateProcurementTotals({
  merchandiseCostMinor = 0,
  procurementFeeMinor = 0,
  deliveryFeeMinor = 0,
  taxMinor = 0,
  discountMinor = 0,
  reimbursementMinor = 0,
  amountAuthorizedMinor = 0,
}) {
  const totalSpentMinor =
    Number(merchandiseCostMinor) +
    Number(procurementFeeMinor) +
    Number(deliveryFeeMinor) +
    Number(taxMinor) -
    Number(discountMinor);

  if (totalSpentMinor < 0) {
    const error = new Error('Procurement spend cannot be negative');
    error.status = 422;
    error.code = 'NEGATIVE_PROCUREMENT_SPEND';
    throw error;
  }

  const refundable =
    Math.max(
      0,
      Number(amountAuthorizedMinor) -
      totalSpentMinor +
      Number(reimbursementMinor)
    );

  return {
    merchandiseCostMinor: Number(merchandiseCostMinor),
    procurementFeeMinor: Number(procurementFeeMinor),
    deliveryFeeMinor: Number(deliveryFeeMinor),
    taxMinor: Number(taxMinor),
    discountMinor: Number(discountMinor),
    reimbursementMinor: Number(reimbursementMinor),
    amountAuthorizedMinor: Number(amountAuthorizedMinor),
    amountSpentMinor: totalSpentMinor,
    amountRefundableMinor: refundable,
  };
}

module.exports = {
  calculateProcurementTotals,
};
