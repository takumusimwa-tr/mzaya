const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PushDevice = sequelize.define('PushDevice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  platform: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  push_token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  device_id: {
    type: DataTypes.STRING(180),
    allowNull: true,
  },
  app_version: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  locale: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  last_seen_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'push_devices',
  underscored: true,
  timestamps: true,
});

module.exports = PushDevice;
