const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

module.exports = sequelize.define('FinanceControlAssessment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  procedure_id: { type: DataTypes.UUID, allowNull: true },
  control_key: { type: DataTypes.STRING(120), allowNull: false },
  control_name: { type: DataTypes.STRING(180), allowNull: false },
  control_area: { type: DataTypes.STRING(60), allowNull: false },
  design_rating: { type: DataTypes.STRING(30), allowNull: true },
  operating_rating: { type: DataTypes.STRING(30), allowNull: true },
  test_period_from: { type: DataTypes.DATEONLY, allowNull: true },
  test_period_to: { type: DataTypes.DATEONLY, allowNull: true },
  population_size: { type: DataTypes.INTEGER, allowNull: true },
  sample_size: { type: DataTypes.INTEGER, allowNull: true },
  exceptions_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  effectiveness_score: { type: DataTypes.DECIMAL(8, 4), allowNull: true },
  conclusion: { type: DataTypes.STRING(1500), allowNull: true },
  assessed_by: { type: DataTypes.UUID, allowNull: true },
  assessed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: 'finance_control_assessments', underscored: true, timestamps: false, createdAt: 'created_at' });
