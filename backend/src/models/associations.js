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

module.exports = {
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
};