const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PushDeliveryLog = sequelize.define('PushDeliveryLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  device_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  event_key: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(24),
    allowNull: false,
    defaultValue: 'pending',
  },
  provider: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  provider_message_id: {
    type: DataTypes.STRING(180),
    allowNull: true,
  },
  error_message: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  attempted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'push_delivery_log',
  underscored: true,
  timestamps: true,
});

module.exports = PushDeliveryLog;
