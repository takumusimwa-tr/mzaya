const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageReport = sequelize.define('MessageReport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message_id: { type: DataTypes.UUID, allowNull: false },
  conversation_id: { type: DataTypes.UUID, allowNull: false },
  reporter_id: { type: DataTypes.UUID, allowNull: false },
  reported_user_id: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.STRING(40), allowNull: false },
  details: { type: DataTypes.STRING(1000), allowNull: true },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  reviewed_by: { type: DataTypes.UUID, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },
  resolution: { type: DataTypes.STRING(80), allowNull: true },
  resolution_notes: { type: DataTypes.STRING(1500), allowNull: true },
}, {
  tableName: 'message_reports',
  underscored: true,
  timestamps: true,
});

module.exports = MessageReport;
