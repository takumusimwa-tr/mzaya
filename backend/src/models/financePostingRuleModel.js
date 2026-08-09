const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinancePostingRule: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinancePostingRule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  rule_key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  event_type: { type: DataTypes.STRING(120), allowNull: false },
  source_system: { type: DataTypes.STRING(80), allowNull: true },
  priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
  condition_expression: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  posting_template_key: { type: DataTypes.STRING(120), allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  effective_from: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  effective_to: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_posting_rules',
  underscored: true,
  timestamps: true,
});
