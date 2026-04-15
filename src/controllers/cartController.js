const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const items = await cartService.getCart(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total: +total.toFixed(2) });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });
    const item = await cartService.addToCart(req.user.id, product_id, quantity);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: 'quantity must be ≥ 1' });
    const item = await cartService.updateCartItem(req.params.id, req.user.id, quantity);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const removed = await cartService.removeCartItem(req.params.id, req.user.id);
    if (!removed) return res.status(404).json({ message: 'Cart item not found' });
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
