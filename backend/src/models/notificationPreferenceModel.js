const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  in_app: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  push: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  email: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  sms: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'notification_preferences',
  underscored: true,
  timestamps: true,
  indexes: [{
    unique: true,
    fields: ['user_id', 'category'],
  }],
});

module.exports = NotificationPreference;
