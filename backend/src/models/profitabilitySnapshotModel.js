const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('ProfitabilitySnapshot', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, snapshot_date: { type: DataTypes.DATEONLY, allowNull: false },
  dimension_type: { type: DataTypes.STRING(40), allowNull: false }, dimension_value: { type: DataTypes.STRING(160), allowNull: false }, currency: { type: DataTypes.STRING(3), allowNull: false },
  order_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, gross_order_value_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  recognized_revenue_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, direct_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  allocated_overhead_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, contribution_margin_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  contribution_margin_ratio: DataTypes.DECIMAL(12,6), net_margin_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'profitability_snapshots', underscored: true, timestamps: true });
