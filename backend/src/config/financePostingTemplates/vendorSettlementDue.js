module.exports = {
  templateKey: 'vendor_settlement_due',
  name: 'Vendor settlement due',
  eventType: 'vendor.settlement_due',
  lines: [
    {
      accountCode: 'CUSTOMER_FUNDS_CLEARING',
      direction: 'debit',
      amountSource: 'event.payload.amountDueMinor',
      memo: 'Vendor funds released from order clearing',
    },
    {
      accountCode: 'VENDOR_PAYABLE',
      direction: 'credit',
      amountSource: 'event.payload.amountDueMinor',
      memo: 'Vendor settlement payable recognized',
    },
  ],
};
