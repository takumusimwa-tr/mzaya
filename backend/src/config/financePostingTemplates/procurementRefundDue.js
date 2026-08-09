module.exports = {
  templateKey: 'procurement_refund_due',
  name: 'Procurement unused funds refundable',
  eventType: 'procurement.refund_due',
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.amountRefundableMinor',
      memo: 'Unused procurement funds released',
    },
    {
      accountCode: 'CUSTOMER_REFUND_PAYABLE',
      direction: 'credit',
      amountSource: 'event.payload.amountRefundableMinor',
      memo: 'Refund due to customer',
    },
  ],
};
