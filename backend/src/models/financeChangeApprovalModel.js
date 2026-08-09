const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceChangeApproval', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  change_request_id: { type: DataTypes.UUID, allowNull: false },
  approver_id: { type: DataTypes.UUID, allowNull: false },
  decision: { type: DataTypes.STRING(20), allowNull: false },
  notes: { type: DataTypes.STRING(1200), allowNull: true },
  decided_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

}, { tableName: 'finance_change_approvals', underscored: true, timestamps: true });
