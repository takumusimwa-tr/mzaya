const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinancePostingTemplate: Batch 08.4.7 finance event-engine persistence model.
module.exports = sequelize.define('FinancePostingTemplate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  template_key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.STRING(1000), allowNull: true },
  currency_source: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'event.currency' },
  reference_source: { type: DataTypes.STRING(120), allowNull: false, defaultValue: 'event.event_key' },
  lines: { type: DataTypes.JSONB, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  version_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },

}, {
  tableName: 'finance_posting_templates',
  underscored: true,
  timestamps: true,
});
