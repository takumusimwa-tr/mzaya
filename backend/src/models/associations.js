// ─── Load all models ──────────────────────────────────────────────────────────
const User            = require('./userModel');
const Order           = require('./orderModel');
const OrderFood       = require('./orderFoodModel');
const OrderGrocery    = require('./orderGroceryModel');
const OrderMaterials  = require('./orderMaterialsModel');
const OrderErrand     = require('./orderErrandModel');

// ─── User → Orders ───────────────────────────────────────────────────────────
User.hasMany(Order,  { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

User.hasMany(Order,  { foreignKey: 'rider_id', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'rider_id', as: 'rider' });

// ─── Order → Detail tables (one-to-one) ──────────────────────────────────────
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
};