function calculateVendorSettlement({
  grossSalesMinor = 0,
  refundsMinor = 0,
  discountsMinor = 0,
  commissionMinor = 0,
  platformFeeMinor = 0,
  taxWithheldMinor = 0,
  adjustmentsMinor = 0,
}) {
  const gross = Number(grossSalesMinor);
  const deductions =
    Number(refundsMinor) +
    Number(discountsMinor) +
    Number(commissionMinor) +
    Number(platformFeeMinor) +
    Number(taxWithheldMinor);

  const amountDueMinor = gross - deductions + Number(adjustmentsMinor);

  if (amountDueMinor < 0) {
    const error = new Error('Vendor settlement cannot result in a negative payable');
    error.status = 422;
    error.code = 'NEGATIVE_VENDOR_SETTLEMENT';
    throw error;
  }

  return {
    grossSalesMinor: gross,
    refundsMinor: Number(refundsMinor),
    discountsMinor: Number(discountsMinor),
    commissionMinor: Number(commissionMinor),
    platformFeeMinor: Number(platformFeeMinor),
    taxWithheldMinor: Number(taxWithheldMinor),
    adjustmentsMinor: Number(adjustmentsMinor),
    amountDueMinor,
  };
}

module.exports = {
  calculateVendorSettlement,
};
