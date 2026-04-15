const productService = require('../services/productService');

const getProducts = async (req, res, next) => {
  try {
    const { search, category, page } = req.query;
    const result = await productService.getProducts({ search, category, page });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category_id, images } = req.body;
    if (!name || !price || !stock)
      return res.status(400).json({ message: 'name, price, and stock are required' });

    const product = await productService.createProduct({
      user_id: req.user.id,
      name,
      description,
      price,
      stock,
      category_id: category_id || null,
      images: images || [],
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await productService.getProductsByUser(req.user.id);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, getMyProducts, getCategories };
