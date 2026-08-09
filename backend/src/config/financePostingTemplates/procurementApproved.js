module.exports = {
  templateKey: 'procurement_approved_authorization',
  name: 'Procurement approved — authorization trace',
  eventType: 'procurement.approved',
  lines: [
    {
      accountCode: 'PROCUREMENT_AUTHORIZATION_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.amountAuthorizedMinor',
      memo: 'Procurement authorization trace',
    },
    {
      accountCode: 'PROCUREMENT_AUTHORIZATION_CLEARING',
      direction: 'credit',
      amountSource: 'event.payload.amountAuthorizedMinor',
      memo: 'Procurement authorization trace',
    },
  ],
};
