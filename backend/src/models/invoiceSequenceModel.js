const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InvoiceSequence = sequelize.define('InvoiceSequence', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  document_type: { type: DataTypes.STRING(30), allowNull: false },
  prefix: { type: DataTypes.STRING(20), allowNull: false },
  next_number: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1 },
  padding: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 6 },
  fiscal_year: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, {
  tableName: 'invoice_sequences',
  underscored: true,
  timestamps: true,
});

module.exports = InvoiceSequence;
