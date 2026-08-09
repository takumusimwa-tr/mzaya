module.exports = {
  templateKey: 'order_cancelled_no_revenue',
  name: 'Order cancelled — no revenue posting',
  eventType: 'order.cancelled',
  lines: [
    {
      accountCode: 'ORDER_CANCELLATION_CLEARING',
      direction: 'debit',
      amountMinor: 0,
      memo: 'Cancellation trace line',
    },
    {
      accountCode: 'ORDER_CANCELLATION_CLEARING',
      direction: 'credit',
      amountMinor: 0,
      memo: 'Cancellation trace line',
    },
  ],
};
