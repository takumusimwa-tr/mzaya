const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  event_key: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
  },
  title: {
    type: DataTypes.STRING(140),
    allowNull: false,
  },
  body: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  action_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  archived_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  underscored: true,
  timestamps: true,
});

module.exports = Notification;
