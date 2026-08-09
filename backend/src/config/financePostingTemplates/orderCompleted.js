module.exports = {
  templateKey: 'order_completed_revenue_allocation',
  name: 'Order completed — revenue allocation',
  eventType: 'order.completed',
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.platformFeeMinor',
      memo: 'Release platform fee from customer funds',
    },
    {
      accountCode: 'PLATFORM_REVENUE',
      direction: 'credit',
      amountSource: 'event.payload.platformFeeMinor',
      memo: 'Platform fee earned',
    },
  ],
};
