const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaxInvoice = sequelize.define('TaxInvoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  invoice_number: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  document_type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'invoice' },
  jurisdiction_id: { type: DataTypes.UUID, allowNull: false },
  order_id: { type: DataTypes.UUID, allowNull: true },
  payment_id: { type: DataTypes.UUID, allowNull: true },
  customer_id: { type: DataTypes.UUID, allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  subtotal_minor: { type: DataTypes.BIGINT, allowNull: false },
  tax_minor: { type: DataTypes.BIGINT, allowNull: false },
  total_minor: { type: DataTypes.BIGINT, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'issued' },
  issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  voided_at: { type: DataTypes.DATE, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  created_by: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'tax_invoices',
  underscored: true,
  timestamps: true,
});

module.exports = TaxInvoice;
