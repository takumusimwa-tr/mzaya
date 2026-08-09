module.exports = {
  templateKey: 'procurement_fee_earned',
  name: 'Procurement fee earned',
  eventType: 'procurement.completed',
  conditions: {
    'payload.procurementFeeMinor': 'positive',
  },
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.procurementFeeMinor',
      memo: 'Release procurement fee from customer funds',
    },
    {
      accountCode: 'PROCUREMENT_REVENUE',
      direction: 'credit',
      amountSource: 'event.payload.procurementFeeMinor',
      memo: 'Procurement fee earned',
    },
  ],
};
