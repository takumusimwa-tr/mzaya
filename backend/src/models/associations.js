const User = require('./userModel');
const Order = require('./orderModel');
const OrderFood = require('./orderFoodModel');
const OrderGrocery = require('./orderGroceryModel');
const OrderMaterials = require('./orderMaterialsModel');
const OrderErrand = require('./orderErrandModel');
const Vendor = require('./vendorModel');
const MenuItem = require('./menuItemModel');
const Rider = require('./riderModel');
const City = require('./cityModel');
const Promo = require('./promoModel');
const Brand = require('./brandModel');
const OrderOffer = require('./orderOfferModel');
const OrderMessage = require('./orderMessageModel');
const PaymentAttempt = require('./paymentAttemptModel');
const PaymentEvent = require('./paymentEventModel');
const Favorite = require('./favoriteModel');
const Address = require('./addressModel');

// Existing finance/payment core.
const PaymentAccount = require('./paymentAccountModel');
const PaymentIdempotencyKey = require('./paymentIdempotencyKeyModel');
const PaymentReconciliationRecord = require('./paymentReconciliationRecordModel');
const LedgerTransaction = require('./ledgerTransactionModel');
const LedgerEntry = require('./ledgerEntryModel');
const Refund = require('./refundModel');
const OrderEconomics = require('./orderEconomicsModel');

// Batch 08.4.7 — accounting event engine.
const FinanceBusinessEvent = require('./financeBusinessEventModel');
const FinanceAccountingEvent = require('./financeAccountingEventModel');
const FinancePostingRule = require('./financePostingRuleModel');
const FinancePostingTemplate = require('./financePostingTemplateModel');
const FinanceJournalBatch = require('./financeJournalBatchModel');
const FinanceJournalBatchEvent = require('./financeJournalBatchEventModel');
const FinancePostingFailure = require('./financePostingFailureModel');
const FinanceReplayQueue = require('./financeReplayQueueModel');
const FinanceIntegrationLog = require('./financeIntegrationLogModel');

// Batch 08.4.8 — outbox reliability.
const FinanceOutboxEvent = require('./financeOutboxEventModel');
const FinanceDeliveryLease = require('./financeDeliveryLeaseModel');
const FinanceDeliveryAttempt = require('./financeDeliveryAttemptModel');
const FinanceConsumerOffset = require('./financeConsumerOffsetModel');
const FinanceDeadLetter = require('./financeDeadLetterModel');
const FinanceReliabilitySnapshot = require('./financeReliabilitySnapshotModel');

// Batch 08.5 operational-finance reconciliation.
const PaymentFinanceReconciliationResult =
  require('./paymentFinanceReconciliationResultModel');
const OrderFinanceReconciliationResult =
  require('./orderFinanceReconciliationResultModel');
const VendorSettlement = require('./vendorSettlementModel');
const VendorSettlementItem = require('./vendorSettlementItemModel');
const VendorSettlementFinanceReconciliationResult =
  require('./vendorSettlementFinanceReconciliationResultModel');
const MzayaPayout = require('./mzayaPayoutModel');
const MzayaPayoutItem = require('./mzayaPayoutItemModel');
const MzayaPayoutFinanceReconciliationResult =
  require('./mzayaPayoutFinanceReconciliationResultModel');
const ProcurementRun = require('./procurementRunModel');
const ProcurementItem = require('./procurementItemModel');
const ProcurementFinanceReconciliationResult =
  require('./procurementFinanceReconciliationResultModel');
const TreasuryTransfer = require('./treasuryTransferModel');
const BankMovement = require('./bankMovementModel');
const TreasuryFinanceReconciliationResult =
  require('./treasuryFinanceReconciliationResultModel');
const TaxTransaction = require('./taxTransactionModel');
const TaxLiability = require('./taxLiabilityModel');
const TaxRemittance = require('./taxRemittanceModel');
const TaxFinanceReconciliationResult =
  require('./taxFinanceReconciliationResultModel');

// Batch 08.5.8 — cutover.
const FinanceDomainReconciliationSnapshot =
  require('./financeDomainReconciliationSnapshotModel');
const FinanceCutoverControl = require('./financeCutoverControlModel');
const FinanceCutoverReadinessCheck =
  require('./financeCutoverReadinessCheckModel');
const FinanceCutoverDecision = require('./financeCutoverDecisionModel');
const FinanceLegacyPostingAttempt =
  require('./financeLegacyPostingAttemptModel');
const FinanceCrossDomainReconciliationRun =
  require('./financeCrossDomainReconciliationRunModel');
const FinanceCrossDomainReconciliationException =
  require('./financeCrossDomainReconciliationExceptionModel');

// Compatibility alias: the live product's canonical payment record is an
// immutable PaymentAttempt. Older finance modules used the generic name Payment.
const Payment = PaymentAttempt;

// ─── Core product associations ───────────────────────────────────────────────
City.hasMany(Vendor, { foreignKey: 'city_id', as: 'vendors' });
Vendor.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(Rider, { foreignKey: 'city_id', as: 'riders' });
Rider.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(User, { foreignKey: 'city_id', as: 'users' });
User.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

User.hasOne(Vendor, { foreignKey: 'owner_id', as: 'vendor' });
Vendor.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Vendor.hasMany(MenuItem, { foreignKey: 'vendor_id', as: 'menuItems' });
MenuItem.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Brand.hasMany(Vendor, { foreignKey: 'brand_id', as: 'branches' });
Vendor.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

User.hasMany(Brand, { foreignKey: 'owner_id', as: 'brands' });
Brand.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(Favorite, { foreignKey: 'customer_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Brand.hasMany(Favorite, { foreignKey: 'brand_id', as: 'favoritedBy' });
Favorite.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

User.hasMany(Address, { foreignKey: 'customer_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.hasOne(Rider, { foreignKey: 'user_id', as: 'riderProfile' });
Rider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
User.hasMany(Order, { foreignKey: 'rider_id', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });

Order.hasOne(OrderFood, { foreignKey: 'order_id', as: 'foodDetail' });
Order.hasOne(OrderGrocery, { foreignKey: 'order_id', as: 'groceryDetail' });
Order.hasOne(OrderMaterials, { foreignKey: 'order_id', as: 'materialsDetail' });
Order.hasOne(OrderErrand, { foreignKey: 'order_id', as: 'errandDetail' });

OrderFood.belongsTo(Order, { foreignKey: 'order_id' });
OrderGrocery.belongsTo(Order, { foreignKey: 'order_id' });
OrderMaterials.belongsTo(Order, { foreignKey: 'order_id' });
OrderErrand.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(OrderOffer, { foreignKey: 'order_id', as: 'offers' });
OrderOffer.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderOffer.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });

Order.hasMany(OrderMessage, { foreignKey: 'order_id', as: 'messages' });
OrderMessage.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

Order.hasMany(PaymentAttempt, {
  foreignKey: 'order_id',
  as: 'paymentAttempts',
});
PaymentAttempt.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

PaymentAttempt.hasMany(PaymentEvent, {
  foreignKey: 'attempt_id',
  as: 'events',
});
PaymentEvent.belongsTo(PaymentAttempt, {
  foreignKey: 'attempt_id',
  as: 'attempt',
});

// ─── Ledger and finance integration associations ─────────────────────────────
LedgerTransaction.hasMany(LedgerEntry, {
  foreignKey: 'transaction_id',
  as: 'entries',
});
LedgerEntry.belongsTo(LedgerTransaction, {
  foreignKey: 'transaction_id',
  as: 'transaction',
});

PaymentAccount.hasMany(LedgerEntry, {
  foreignKey: 'account_id',
  as: 'entries',
});
LedgerEntry.belongsTo(PaymentAccount, {
  foreignKey: 'account_id',
  as: 'account',
});

PaymentAttempt.hasMany(Refund, {
  foreignKey: 'payment_id',
  as: 'refunds',
});
Refund.belongsTo(PaymentAttempt, {
  foreignKey: 'payment_id',
  as: 'payment',
});

Order.hasOne(OrderEconomics, {
  foreignKey: 'order_id',
  as: 'economics',
});
OrderEconomics.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

FinanceBusinessEvent.hasOne(FinanceAccountingEvent, {
  foreignKey: 'business_event_id',
  as: 'accountingEvent',
});
FinanceAccountingEvent.belongsTo(FinanceBusinessEvent, {
  foreignKey: 'business_event_id',
  as: 'businessEvent',
});

FinanceJournalBatch.belongsToMany(FinanceAccountingEvent, {
  through: FinanceJournalBatchEvent,
  foreignKey: 'journal_batch_id',
  otherKey: 'accounting_event_id',
  as: 'accountingEvents',
});
FinanceAccountingEvent.belongsToMany(FinanceJournalBatch, {
  through: FinanceJournalBatchEvent,
  foreignKey: 'accounting_event_id',
  otherKey: 'journal_batch_id',
  as: 'journalBatches',
});

FinanceOutboxEvent.hasMany(FinanceDeliveryAttempt, {
  foreignKey: 'outbox_event_id',
  as: 'deliveryAttempts',
});
FinanceOutboxEvent.hasMany(FinanceDeliveryLease, {
  foreignKey: 'outbox_event_id',
  as: 'leases',
});
FinanceOutboxEvent.hasMany(FinanceDeadLetter, {
  foreignKey: 'outbox_event_id',
  as: 'deadLetters',
});

VendorSettlement.hasMany(VendorSettlementItem, {
  foreignKey: 'settlement_id',
  as: 'items',
});
VendorSettlementItem.belongsTo(VendorSettlement, {
  foreignKey: 'settlement_id',
  as: 'settlement',
});

MzayaPayout.hasMany(MzayaPayoutItem, {
  foreignKey: 'payout_id',
  as: 'items',
});
MzayaPayoutItem.belongsTo(MzayaPayout, {
  foreignKey: 'payout_id',
  as: 'payout',
});

ProcurementRun.hasMany(ProcurementItem, {
  foreignKey: 'procurement_id',
  as: 'items',
});
ProcurementItem.belongsTo(ProcurementRun, {
  foreignKey: 'procurement_id',
  as: 'procurement',
});

TreasuryTransfer.hasMany(BankMovement, {
  foreignKey: 'treasury_transfer_id',
  as: 'bankMovements',
});
BankMovement.belongsTo(TreasuryTransfer, {
  foreignKey: 'treasury_transfer_id',
  as: 'treasuryTransfer',
});

TaxLiability.hasMany(TaxRemittance, {
  foreignKey: 'liability_id',
  as: 'remittances',
});
TaxRemittance.belongsTo(TaxLiability, {
  foreignKey: 'liability_id',
  as: 'liability',
});

FinanceCutoverControl.hasMany(FinanceCutoverReadinessCheck, {
  foreignKey: 'control_id',
  as: 'readinessChecks',
});
FinanceCutoverControl.hasMany(FinanceCutoverDecision, {
  foreignKey: 'control_id',
  as: 'decisions',
});
FinanceCrossDomainReconciliationRun.hasMany(
  FinanceCrossDomainReconciliationException,
  {
    foreignKey: 'run_id',
    as: 'exceptions',
  }
);

module.exports = {
  Favorite,
  Address,
  User,
  Order,
  OrderFood,
  OrderGrocery,
  OrderMaterials,
  OrderErrand,
  Vendor,
  MenuItem,
  Rider,
  City,
  Promo,
  Brand,
  OrderOffer,
  OrderMessage,
  Payment,
  PaymentAttempt,
  PaymentEvent,
  PaymentAccount,
  PaymentIdempotencyKey,
  PaymentReconciliationRecord,
  LedgerTransaction,
  LedgerEntry,
  Refund,
  OrderEconomics,

  FinanceBusinessEvent,
  FinanceAccountingEvent,
  FinancePostingRule,
  FinancePostingTemplate,
  FinanceJournalBatch,
  FinanceJournalBatchEvent,
  FinancePostingFailure,
  FinanceReplayQueue,
  FinanceIntegrationLog,
  FinanceOutboxEvent,
  FinanceDeliveryLease,
  FinanceDeliveryAttempt,
  FinanceConsumerOffset,
  FinanceDeadLetter,
  FinanceReliabilitySnapshot,

  PaymentFinanceReconciliationResult,
  OrderFinanceReconciliationResult,
  VendorSettlement,
  VendorSettlementItem,
  VendorSettlementFinanceReconciliationResult,
  MzayaPayout,
  MzayaPayoutItem,
  MzayaPayoutFinanceReconciliationResult,
  ProcurementRun,
  ProcurementItem,
  ProcurementFinanceReconciliationResult,
  TreasuryTransfer,
  BankMovement,
  TreasuryFinanceReconciliationResult,
  TaxTransaction,
  TaxLiability,
  TaxRemittance,
  TaxFinanceReconciliationResult,

  FinanceDomainReconciliationSnapshot,
  FinanceCutoverControl,
  FinanceCutoverReadinessCheck,
  FinanceCutoverDecision,
  FinanceLegacyPostingAttempt,
  FinanceCrossDomainReconciliationRun,
  FinanceCrossDomainReconciliationException,
};
