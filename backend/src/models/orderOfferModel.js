const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A rider's response to a negotiable order: either accepting the customer's
// offered fare, or countering with their own price. The customer picks one.
const OrderOffer = sequelize.define('OrderOffer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // The rider making the offer — references users(id) (consistent with orders.rider_id).
  rider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // The fare the rider is offering to do it for.
  amount_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // 'accept' = took the customer's price as-is; 'counter' = proposed a different price.
  type: {
    type: DataTypes.ENUM('accept', 'counter'),
    allowNull: false,
    defaultValue: 'accept',
  },

  // pending | chosen | declined | withdrawn
  status: {
    type: DataTypes.ENUM('pending', 'chosen', 'declined', 'withdrawn'),
    allowNull: false,
    defaultValue: 'pending',
  },

  // Optional short note from the rider.
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'order_offers',
  timestamps: true,
});

module.exports = OrderOffer;
