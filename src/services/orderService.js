const pool = require('../config/db');

const placeOrder = async ({ user_id, cartItems, shipping }) => {
  return pool.transaction(async (tx) => {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert order
    const [orderResult] = await tx.query(
      `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, total.toFixed(2), shipping.name, shipping.address, shipping.city, shipping.zip, shipping.phone]
    );
    const orderId = orderResult.insertId;

    // Insert items + decrement stock
    for (const item of cartItems) {
      await tx.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity, item.images?.[0] || null]
      );

      const [update] = await tx.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );

      if (update.affectedRows === 0)
        throw Object.assign(new Error(`Insufficient stock for "${item.name}"`), { status: 409 });
    }

    // Clear cart
    await tx.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);

    const [rows] = await tx.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    return rows[0];
  });
};

const getOrderById = async (id, user_id) => {
  const [orders] = await pool.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, user_id]
  );
  if (!orders[0]) return null;

  const [items] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [id]
  );
  return { ...orders[0], items };
};

module.exports = { placeOrder, getOrderById };
