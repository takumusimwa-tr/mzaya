const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryReconciliationReview = sequelize.define(
  'TreasuryReconciliationReview',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    bank_transaction_id: { type: DataTypes.UUID, allowNull: false },
    reconciliation_id: { type: DataTypes.UUID, allowNull: true },
    reviewed_by: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING(40), allowNull: false },
    notes: { type: DataTypes.STRING(1000), allowNull: true },
    previous_status: { type: DataTypes.STRING(30), allowNull: true },
    new_status: { type: DataTypes.STRING(30), allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    reviewed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'treasury_reconciliation_reviews',
    underscored: true,
    timestamps: false,
    createdAt: 'created_at',
  }
);

module.exports = TreasuryReconciliationReview;
