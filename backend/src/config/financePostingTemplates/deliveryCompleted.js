module.exports = {
  templateKey: 'delivery_completed_revenue',
  name: 'Delivery completed — delivery revenue',
  eventType: 'delivery.completed',
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.deliveryFeeMinor',
      memo: 'Release delivery fee from customer funds',
    },
    {
      accountCode: 'DELIVERY_REVENUE',
      direction: 'credit',
      amountSource: 'event.payload.deliveryFeeMinor',
      memo: 'Delivery fee earned',
    },
  ],
};
