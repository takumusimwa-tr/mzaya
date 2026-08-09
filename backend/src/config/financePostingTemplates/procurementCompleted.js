module.exports = {
  templateKey: 'procurement_completed_spend',
  name: 'Procurement completed — spend recognition',
  eventType: 'procurement.completed',
  lines: [
    {
      accountCode: 'PROCUREMENT_COST_OR_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.merchandiseCostMinor',
      memo: 'Procured merchandise cost',
    },
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'credit',
      amountSource: 'event.payload.merchandiseCostMinor',
      memo: 'Customer funds applied to procurement',
    },
  ],
};
