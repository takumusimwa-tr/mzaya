const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TreasuryReconciliationCandidate = sequelize.define(
  'TreasuryReconciliationCandidate',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    bank_transaction_id: { type: DataTypes.UUID, allowNull: false },
    ledger_transaction_id: { type: DataTypes.UUID, allowNull: false },
    score: { type: DataTypes.DECIMAL(6, 4), allowNull: false },
    amount_score: { type: DataTypes.DECIMAL(6, 4), allowNull: false, defaultValue: 0 },
    date_score: { type: DataTypes.DECIMAL(6, 4), allowNull: false, defaultValue: 0 },
    reference_score: { type: DataTypes.DECIMAL(6, 4), allowNull: false, defaultValue: 0 },
    description_score: { type: DataTypes.DECIMAL(6, 4), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'candidate' },
    metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  },
  {
    tableName: 'treasury_reconciliation_candidates',
    underscored: true,
    timestamps: true,
  }
);

module.exports = TreasuryReconciliationCandidate;
