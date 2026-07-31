const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Dispute = sequelize.define('Dispute', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: true },
  payment_id: { type: DataTypes.UUID, allowNull: true },
  customer_id: { type: DataTypes.UUID, allowNull: false },
  vendor_id: { type: DataTypes.UUID, allowNull: true },
  assigned_agent_id: { type: DataTypes.UUID, allowNull: true },
  category: { type: DataTypes.STRING(50), allowNull: false },
  priority: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'normal' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'open' },
  subject: { type: DataTypes.STRING(180), allowNull: false },
  customer_statement: { type: DataTypes.TEXT, allowNull: false },
  vendor_response: { type: DataTypes.TEXT, allowNull: true },
  resolution: { type: DataTypes.STRING(80), allowNull: true },
  resolution_notes: { type: DataTypes.TEXT, allowNull: true },
  response_due_at: { type: DataTypes.DATE, allowNull: true },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'disputes',
  underscored: true,
  timestamps: true,
});

module.exports = Dispute;
