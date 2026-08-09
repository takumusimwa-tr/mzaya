module.exports = {
  templateKey: 'payment_chargeback',
  name: 'Payment chargeback',
  eventType: 'payment.chargeback',
  lines: [
    {
      accountCode: 'CHARGEBACK_EXPENSE_OR_CLEARING',
      direction: 'debit',
      amountSource: 'event.amount_minor',
      memo: 'Chargeback recognized',
    },
    {
      accountCode: 'PAYMENT_PROCESSOR_RECEIVABLE',
      direction: 'credit',
      amountSource: 'event.amount_minor',
      memo: 'Processor balance reduced',
    },
  ],
};
