const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const createUser = async (name, email, password) => {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, hash]
  );
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
};

const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { findUserByEmail, createUser, comparePassword };
