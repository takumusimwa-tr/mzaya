function calculateOrderEconomics(input) {
  const gov=Number(input.grossOrderValueMinor||0), platform=Number(input.platformRevenueMinor||0), delivery=Number(input.deliveryRevenueMinor||0), procurement=Number(input.procurementRevenueMinor||0);
  const discounts=Number(input.discountsMinor||0), refunds=Number(input.refundMinor||0), gateway=Number(input.gatewayFeesMinor||0), payout=Number(input.mzayaPayoutMinor||0);
  const direct=Number(input.directCostMinor||0), overhead=Number(input.allocatedOverheadMinor||0);
  const revenue=platform+delivery+procurement-discounts-refunds;
  const contribution=revenue-gateway-payout-direct;
  return { recognizedRevenueMinor: revenue, contributionMarginMinor: contribution,
    contributionMarginRatio: revenue===0?null:Number((contribution/revenue).toFixed(6)),
    netMarginMinor: contribution-overhead, grossMarginRatio: gov===0?null:Number((revenue/gov).toFixed(6)) };
}
module.exports={ calculateOrderEconomics };
