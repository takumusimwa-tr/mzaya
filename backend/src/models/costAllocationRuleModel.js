const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
module.exports = sequelize.define('CostAllocationRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, rule_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false }, source_cost_type: { type: DataTypes.STRING(60), allowNull: false },
  target_dimension: { type: DataTypes.STRING(40), allowNull: false }, allocation_method: { type: DataTypes.STRING(40), allowNull: false },
  currency: DataTypes.STRING(3), status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' }, metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'cost_allocation_rules', underscored: true, timestamps: true });
