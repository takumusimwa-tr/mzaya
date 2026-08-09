module.exports = {
  templateKey: 'procurement_fee_earned_legacy_reference',
  name: 'Procurement fee earned — legacy reference only',
  eventType: 'procurement.fee_reference_only',
  description:
    'Deprecated standalone fee template retained for audit compatibility. New procurement.completed events use the composite procurement_completed_spend template.',
  lines: [
    {
      accountCode: 'PROCUREMENT_AUTHORIZATION_CLEARING',
      direction: 'debit',
      amountMinor: 0,
      memo: 'Legacy reference only',
    },
    {
      accountCode: 'PROCUREMENT_AUTHORIZATION_CLEARING',
      direction: 'credit',
      amountMinor: 0,
      memo: 'Legacy reference only',
    },
  ],
};
