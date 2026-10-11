const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/userModel');
const { USER_ROLE, JWT } = require('../config/constants');
const { logger } = require('../utils/logger');

function normalizeOptionalEmail(value) {
  if (value === undefined) return undefined;
  const email = String(value || '').trim().toLowerCase();
  return email || null;
}

function normalizePhone(value) {
  if (value === undefined) return undefined;
  return String(value || '').trim();
}

// ─── Register ─────────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'name, phone and password are required' });
    }

    const allowedRoles = [USER_ROLE.CUSTOMER, USER_ROLE.RIDER, USER_ROLE.VENDOR];
    const assignedRole = allowedRoles.includes(role) ? role : USER_ROLE.CUSTOMER;

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      phone: normalizePhone(phone),
      email: normalizeOptionalEmail(email) ?? null,
      password: hashed,
      role: assignedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    logger.error('register_error', { error: err.message });
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
    logger.error('login_error', { error: err.message });
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

// ─── Update current user ──────────────────────────────────────────────────────
// This is deliberately a narrow self-service contract. Role, verification,
// password, city and location are not writable here.
async function updateMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const requestedName = req.body.name === undefined
      ? undefined
      : String(req.body.name || '').trim();
    const requestedPhone = normalizePhone(req.body.phone);
    const requestedEmail = normalizeOptionalEmail(req.body.email);

    if (requestedName !== undefined && !requestedName) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    if (requestedPhone !== undefined && !requestedPhone) {
      return res.status(400).json({ error: 'Phone cannot be empty' });
    }

    if (requestedPhone !== undefined && requestedPhone !== user.phone) {
      const phoneOwner = await User.findOne({
        where: { phone: requestedPhone, id: { [Op.ne]: user.id } },
      });
      if (phoneOwner) return res.status(409).json({ error: 'Phone number already registered' });
      user.phone = requestedPhone;
    }

    if (requestedEmail !== undefined && requestedEmail !== user.email) {
      if (requestedEmail) {
        const emailOwner = await User.findOne({
          where: { email: requestedEmail, id: { [Op.ne]: user.id } },
        });
        if (emailOwner) return res.status(409).json({ error: 'Email address already registered' });
      }
      user.email = requestedEmail;
    }

    if (requestedName !== undefined) user.name = requestedName;

    await user.save();

    // Phone is embedded in the current JWT payload. Reissue the token after any
    // profile update so client/session identity remains internally consistent.
    const token = signToken(user);

    return res.status(200).json({
      message: 'Profile updated successfully',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    if (err?.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid profile details' });
    }
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Phone or email already registered' });
    }
    logger.error('update_me_error', { error: err.message, userId: req.user?.id });
    return res.status(500).json({ error: 'Could not update profile' });
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
  const { password: _password, ...safe } = user.toJSON();
  return safe;
}

module.exports = { register, login, me, updateMe };
