module.exports = {
  templateKey: 'vendor_settlement_paid',
  name: 'Vendor settlement paid',
  eventType: 'vendor.settlement_paid',
  lines: [
    {
      accountCode: 'VENDOR_PAYABLE',
      direction: 'debit',
      amountSource: 'event.payload.amountPaidMinor',
      memo: 'Vendor payable settled',
    },
    {
      accountCode: 'CASH_AT_BANK',
      direction: 'credit',
      amountSource: 'event.payload.amountPaidMinor',
      memo: 'Vendor settlement cash outflow',
    },
  ],
};
