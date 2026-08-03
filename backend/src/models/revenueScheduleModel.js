const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('RevenueSchedule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false }, payment_id: { type: DataTypes.UUID, allowNull: true },
  rule_id: { type: DataTypes.UUID, allowNull: false }, revenue_type: { type: DataTypes.STRING(50), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false }, gross_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  recognized_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, deferred_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  reversed_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'scheduled' },
  recognition_date: { type: DataTypes.DATEONLY, allowNull: true }, source_reference: { type: DataTypes.STRING(160), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'revenue_schedules', underscored: true, timestamps: true });
