const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('OrderEconomics', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, order_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  vendor_id: DataTypes.UUID, customer_id: DataTypes.UUID, mzaya_id: DataTypes.UUID, city_code: DataTypes.STRING(60), service_category: DataTypes.STRING(60),
  currency: { type: DataTypes.STRING(3), allowNull: false }, gross_order_value_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  merchandise_value_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, platform_revenue_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  delivery_revenue_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, procurement_revenue_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  discounts_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, taxes_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  gateway_fees_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, mzaya_payout_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  vendor_settlement_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, refund_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  direct_cost_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, allocated_overhead_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  contribution_margin_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, contribution_margin_ratio: DataTypes.DECIMAL(12,6),
  net_margin_minor: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, completed_at: DataTypes.DATE,
  recalculated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'order_economics', underscored: true, timestamps: true });
