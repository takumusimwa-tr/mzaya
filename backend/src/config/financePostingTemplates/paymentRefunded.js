module.exports = {
  templateKey: 'payment_refunded_customer_funds',
  name: 'Payment refunded — customer funds',
  eventType: 'payment.refunded',
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.amount_minor',
      memo: 'Refund liability reversal',
    },
    {
      accountCode: 'PAYMENT_PROCESSOR_RECEIVABLE',
      direction: 'credit',
      amountSource: 'event.amount_minor',
      memo: 'Refund from processor balance',
    },
  ],
};
