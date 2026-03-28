const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { USER_ROLE, JWT } = require('../config/constants');

// ─── Register ─────────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'name, phone and password are required' });
    }

    // Only allow safe roles on self-registration
    const allowedRoles = [USER_ROLE.CUSTOMER, USER_ROLE.RIDER, USER_ROLE.VENDOR];
    const assignedRole = allowedRoles.includes(role) ? role : USER_ROLE.CUSTOMER;

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email:    email || null,
      password: hashed,
      role:     assignedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'phone and password are required' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
}

// ─── Get current user (requires auth middleware) ──────────────────────────────
async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Could not fetch user' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: JWT.EXPIRES_IN }
  );
}

function safeUser(user) {
  // Never return password hash to client
  const { password, ...safe } = user.toJSON();
  return safe;
}

module.exports = { register, login, me };