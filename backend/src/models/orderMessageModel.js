const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// A message in an order's conversation. All parties on the order (customer,
// assigned rider, vendor owner) share one thread, tagged by sender role.
const OrderMessage = sequelize.define('OrderMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // The user who sent it (references users.id).
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Role of the sender within this order, for display: customer | rider | vendor.
  sender_role: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Read receipt (simple: whether anyone other than sender has seen it).
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'order_messages',
  timestamps: true,
});

module.exports = OrderMessage;
