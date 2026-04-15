const pool = require('../config/db');

const getCart = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.quantity,
            p.id AS product_id, p.name, p.price, p.stock, p.images
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at`,
    [user_id]
  );
  return rows;
};

const addToCart = async (user_id, product_id, quantity = 1) => {
  // PostgreSQL upsert: increment quantity on unique conflict
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [user_id, product_id, quantity]
  );
  const [rows] = await pool.query(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );
  return rows[0];
};

const updateCartItem = async (id, user_id, quantity) => {
  const [result] = await pool.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, user_id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query('SELECT * FROM cart_items WHERE id = ?', [id]);
  return rows[0];
};

const removeCartItem = async (id, user_id) => {
  const [result] = await pool.query(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [id, user_id]
  );
  return result.affectedRows > 0;
};

const clearCart = async (user_id) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
