const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// FinanceDeliveryLease: Batch 08.4.8 delivery reliability persistence model.
module.exports = sequelize.define('FinanceDeliveryLease', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  outbox_event_id: { type: DataTypes.UUID, allowNull: false },
  lease_owner: { type: DataTypes.STRING(120), allowNull: false },
  leased_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  lease_expires_at: { type: DataTypes.DATE, allowNull: false },
  released_at: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },

}, {
  tableName: 'finance_delivery_leases',
  underscored: true,
  timestamps: true,
});
