const User            = require('./userModel');
const Order           = require('./orderModel');
const OrderFood       = require('./orderFoodModel');
const OrderGrocery    = require('./orderGroceryModel');
const OrderMaterials  = require('./orderMaterialsModel');
const OrderErrand     = require('./orderErrandModel');
const Vendor          = require('./vendorModel');
const MenuItem        = require('./menuItemModel');
const Rider           = require('./riderModel');
const City            = require('./cityModel');
const Promo           = require('./promoModel');
const Brand           = require('./brandModel');
const OrderOffer      = require('./orderOfferModel');
const OrderMessage    = require('./orderMessageModel');
const PaymentAttempt  = require('./paymentAttemptModel');
const PaymentEvent    = require('./paymentEventModel');
const Favorite        = require('./favoriteModel');
const Address         = require('./addressModel');

// ─── City associations ────────────────────────────────────────────────────────
City.hasMany(Vendor, { foreignKey: 'city_id', as: 'vendors' });
Vendor.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(Rider, { foreignKey: 'city_id', as: 'riders' });
Rider.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(User, { foreignKey: 'city_id', as: 'users' });
User.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// ─── Vendor associations ──────────────────────────────────────────────────────
User.hasOne(Vendor, { foreignKey: 'owner_id', as: 'vendor' });
Vendor.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Vendor.hasMany(MenuItem, { foreignKey: 'vendor_id', as: 'menuItems' });
MenuItem.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// ─── Brand → Branch (vendor) associations ─────────────────────────────────────
// A Brand is the customer-facing storefront; each Vendor row is a physical branch.
Brand.hasMany(Vendor, { foreignKey: 'brand_id', as: 'branches' });
Vendor.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

User.hasMany(Brand, { foreignKey: 'owner_id', as: 'brands' });
Brand.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// ─── Favorite associations ────────────────────────────────────────────────────
// A customer favourites a brand. FKs give sync the columns + referential
// integrity; the controllers query the table by raw SQL.
User.hasMany(Favorite,  { foreignKey: 'customer_id', as: 'favorites' });
Favorite.belongsTo(User,  { foreignKey: 'customer_id', as: 'customer' });
Brand.hasMany(Favorite, { foreignKey: 'brand_id', as: 'favoritedBy' });
Favorite.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

// ─── Address associations ─────────────────────────────────────────────────────
User.hasMany(Address,  { foreignKey: 'customer_id', as: 'addresses' });
Address.belongsTo(User,  { foreignKey: 'customer_id', as: 'customer' });

// ─── Rider associations ───────────────────────────────────────────────────────
User.hasOne(Rider, { foreignKey: 'user_id', as: 'riderProfile' });
Rider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── User → Orders ───────────────────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.hasMany(Order, { foreignKey: 'rider_id', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });

// ─── Order detail tables ──────────────────────────────────────────────────────
Order.hasOne(OrderFood,      { foreignKey: 'order_id', as: 'foodDetail' });
Order.hasOne(OrderGrocery,   { foreignKey: 'order_id', as: 'groceryDetail' });
Order.hasOne(OrderMaterials, { foreignKey: 'order_id', as: 'materialsDetail' });
Order.hasOne(OrderErrand,    { foreignKey: 'order_id', as: 'errandDetail' });

OrderFood.belongsTo(Order,      { foreignKey: 'order_id' });
OrderGrocery.belongsTo(Order,   { foreignKey: 'order_id' });
OrderMaterials.belongsTo(Order, { foreignKey: 'order_id' });
OrderErrand.belongsTo(Order,    { foreignKey: 'order_id' });

// ─── Order offers (fare negotiation) ──────────────────────────────────────────
Order.hasMany(OrderOffer, { foreignKey: 'order_id', as: 'offers' });
OrderOffer.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderOffer.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });

// ─── Order messages (per-order chat) ──────────────────────────────────────────
Order.hasMany(OrderMessage, { foreignKey: 'order_id', as: 'messages' });
OrderMessage.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// ─── Payments ────────────────────────────────────────────────────────────────
// An order's paid state is DERIVED from its attempts, never written directly.
Order.hasMany(PaymentAttempt, { foreignKey: 'order_id', as: 'paymentAttempts' });
PaymentAttempt.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

PaymentAttempt.hasMany(PaymentEvent, { foreignKey: 'attempt_id', as: 'events' });
PaymentEvent.belongsTo(PaymentAttempt, { foreignKey: 'attempt_id', as: 'attempt' });

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
  PaymentAttempt,
  PaymentEvent,
};