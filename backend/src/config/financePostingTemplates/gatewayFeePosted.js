module.exports = {
  templateKey: 'payment_gateway_fee',
  name: 'Payment gateway fee',
  eventType: 'payment.gateway_fee_posted',
  lines: [
    {
      accountCode: 'PAYMENT_GATEWAY_FEES',
      direction: 'debit',
      amountSource: 'event.payload.gatewayFeeMinor',
      memo: 'Gateway fee expense',
    },
    {
      accountCode: 'PAYMENT_PROCESSOR_RECEIVABLE',
      direction: 'credit',
      amountSource: 'event.payload.gatewayFeeMinor',
      memo: 'Processor fee deduction',
    },
  ],
};
