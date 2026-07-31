const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NotificationDelivery = sequelize.define('NotificationDelivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  notification_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('in_app', 'push', 'email', 'sms'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'delivered', 'failed', 'skipped'),
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
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  last_error: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  next_attempt_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notification_deliveries',
  underscored: true,
  timestamps: true,
  indexes: [{
    unique: true,
    fields: ['notification_id', 'channel'],
  }],
});

module.exports = NotificationDelivery;
