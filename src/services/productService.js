const pool = require('../config/db');

const ITEMS_PER_PAGE = 12;

const getProducts = async ({ search, category, page = 1 }) => {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const conditions = [];
  const values     = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push('p.name LIKE ?');
  }
  if (category) {
    values.push(category);
    conditions.push('c.name LIKE ?');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataQuery = `
    SELECT p.id, p.name, p.price, p.stock, p.images,
           c.name AS category,
           u.name AS seller_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users      u ON u.id = p.user_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${where}
  `;

  const [[products], [countRows]] = await Promise.all([
    pool.query(dataQuery,  [...values, ITEMS_PER_PAGE, offset]),
    pool.query(countQuery, values),
  ]);

  const total = Number(countRows[0].total);

  return {
    products,
    total,
    page:  +page,
    pages: Math.ceil(total / ITEMS_PER_PAGE),
  };
};

const getProductById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category, u.name AS seller_name, u.email AS seller_email
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN users      u ON u.id = p.user_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const createProduct = async ({ user_id, name, description, price, stock, category_id, images }) => {
  const [result] = await pool.query(
    `INSERT INTO products (user_id, name, description, price, stock, category_id, images)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, description, price, stock, category_id, JSON.stringify(images || [])]
  );
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getProductsByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [user_id]
  );
  return rows;
};

const getAllCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  return rows;
};

module.exports = { getProducts, getProductById, createProduct, getProductsByUser, getAllCategories };
