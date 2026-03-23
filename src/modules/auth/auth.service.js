const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');
const { pool } = require('../../config/mysql');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

const ACCESS_TOKEN_TTL = JWT_EXPIRES_IN || '7d';

const issueAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, is_active, password_hash
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const register = async ({ name, email, password, phone }) => {
  if (!name || !email || !password) {
    throw new AppError('name, email and password are required', 400);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES (?, ?, ?, ?, 'manager')`,
    [name, email, passwordHash, phone || null]
  );

  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, wallet_balance, created_at
     FROM users
     WHERE id = ?`,
    [result.insertId]
  );

  const user = rows[0];
  const accessToken = issueAccessToken(user);

  return { user, accessToken };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('email and password are required', 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is disabled', 403);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = issueAccessToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
  };
};

const me = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, wallet_balance, is_active, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    throw new AppError('User not found', 404);
  }

  return rows[0];
};

module.exports = {
  register,
  login,
  me,
};
