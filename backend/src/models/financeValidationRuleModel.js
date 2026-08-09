const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceValidationRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  domain_id: { type: DataTypes.UUID, allowNull: true },
  rule_key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  rule_type: { type: DataTypes.STRING(50), allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'error' },
  configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },

}, { tableName: 'finance_validation_rules', underscored: true, timestamps: true });
