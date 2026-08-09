function calculateMzayaPayout({
  deliveryEarningsMinor = 0,
  tipsMinor = 0,
  incentivesMinor = 0,
  reimbursementsMinor = 0,
  penaltiesMinor = 0,
  withholdingMinor = 0,
  adjustmentsMinor = 0,
}) {
  const gross =
    Number(deliveryEarningsMinor) +
    Number(tipsMinor) +
    Number(incentivesMinor) +
    Number(reimbursementsMinor);

  const deductions =
    Number(penaltiesMinor) +
    Number(withholdingMinor);

  const amountDueMinor =
    gross -
    deductions +
    Number(adjustmentsMinor);

  if (amountDueMinor < 0) {
    const error = new Error('Mzaya payout cannot result in a negative payable');
    error.status = 422;
    error.code = 'NEGATIVE_MZAYA_PAYOUT';
    throw error;
  }

  return {
    deliveryEarningsMinor: Number(deliveryEarningsMinor),
    tipsMinor: Number(tipsMinor),
    incentivesMinor: Number(incentivesMinor),
    reimbursementsMinor: Number(reimbursementsMinor),
    penaltiesMinor: Number(penaltiesMinor),
    withholdingMinor: Number(withholdingMinor),
    adjustmentsMinor: Number(adjustmentsMinor),
    amountDueMinor,
  };
}

module.exports = {
  calculateMzayaPayout,
};
