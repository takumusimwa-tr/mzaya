const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProviderWebhookAttempt = sequelize.define('ProviderWebhookAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  webhook_event_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  error_message: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'provider_webhook_attempts',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = ProviderWebhookAttempt;
