const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageReceipt = sequelize.define('MessageReceipt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'message_receipts',
  underscored: true,
  timestamps: true,
});

module.exports = MessageReceipt;
