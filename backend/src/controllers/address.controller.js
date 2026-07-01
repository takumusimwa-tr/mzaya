const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

// GET /api/addresses — list the customer's saved addresses
async function listAddresses(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT * FROM addresses WHERE customer_id = :uid
       ORDER BY is_default DESC, "createdAt" DESC`,
      { replacements: { uid: req.user.id }, type: QueryTypes.SELECT }
    );
    return res.status(200).json({ addresses: rows });
  } catch (err) {
    console.error('listAddresses error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch addresses' });
  }
}

// POST /api/addresses — add a new address
async function addAddress(req, res) {
  try {
    const { label, address, notes, location, is_default } = req.body;
    if (!label || !address) {
      return res.status(400).json({ error: 'Label and address are required' });
    }

    // If marking default, clear other defaults first
    if (is_default) {
      await sequelize.query(
        `UPDATE addresses SET is_default = false WHERE customer_id = :uid`,
        { replacements: { uid: req.user.id }, type: QueryTypes.UPDATE }
      );
    }

    const rows = await sequelize.query(
      `INSERT INTO addresses (id, customer_id, label, address, notes, location, is_default, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :uid, :label, :address, :notes, :location, :is_default, NOW(), NOW())
       RETURNING *`,
      {
        replacements: {
          uid: req.user.id,
          label,
          address,
          notes: notes || null,
          location: location ? JSON.stringify(location) : null,
          is_default: !!is_default,
        },
        type: QueryTypes.INSERT,
      }
    );
    return res.status(201).json({ address: rows[0][0] });
  } catch (err) {
    console.error('addAddress error:', err.message);
    return res.status(500).json({ error: 'Failed to add address' });
  }
}

// PUT /api/addresses/:id — update an address
async function updateAddress(req, res) {
  try {
    const { id } = req.params;
    const { label, address, notes, is_default } = req.body;

    if (is_default) {
      await sequelize.query(
        `UPDATE addresses SET is_default = false WHERE customer_id = :uid`,
        { replacements: { uid: req.user.id }, type: QueryTypes.UPDATE }
      );
    }

    const rows = await sequelize.query(
      `UPDATE addresses
       SET label = :label, address = :address, notes = :notes, is_default = :is_default, "updatedAt" = NOW()
       WHERE id = :id AND customer_id = :uid
       RETURNING *`,
      {
        replacements: {
          id, uid: req.user.id, label, address,
          notes: notes || null, is_default: !!is_default,
        },
        type: QueryTypes.UPDATE,
      }
    );
    if (!rows[0].length) return res.status(404).json({ error: 'Address not found' });
    return res.status(200).json({ address: rows[0][0] });
  } catch (err) {
    console.error('updateAddress error:', err.message);
    return res.status(500).json({ error: 'Failed to update address' });
  }
}

// DELETE /api/addresses/:id
async function deleteAddress(req, res) {
  try {
    await sequelize.query(
      `DELETE FROM addresses WHERE id = :id AND customer_id = :uid`,
      { replacements: { id: req.params.id, uid: req.user.id }, type: QueryTypes.DELETE }
    );
    return res.status(200).json({ message: 'Address deleted' });
  } catch (err) {
    console.error('deleteAddress error:', err.message);
    return res.status(500).json({ error: 'Failed to delete address' });
  }
}

module.exports = { listAddresses, addAddress, updateAddress, deleteAddress };
