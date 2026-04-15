const orderService = require('../services/orderService');
const cartService  = require('../services/cartService');

const placeOrder = async (req, res, next) => {
  try {
    const { shipping } = req.body;
    if (!shipping) return res.status(400).json({ message: 'Shipping details required' });

    const cartItems = await cartService.getCart(req.user.id);
    if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

    const order = await orderService.placeOrder({ user_id: req.user.id, cartItems, shipping });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getOrderById };
