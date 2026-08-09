module.exports = {
  templateKey: 'payment_capture_customer_funds',
  name: 'Payment captured — customer funds',
  eventType: 'payment.captured',
  lines: [
    {
      accountCode: 'PAYMENT_PROCESSOR_RECEIVABLE',
      direction: 'debit',
      amountSource: 'event.amount_minor',
      memo: 'Captured payment',
    },
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'credit',
      amountSource: 'event.amount_minor',
      memo: 'Customer funds pending allocation',
    },
  ],
};
