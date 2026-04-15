const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/',       getCart);
router.post('/',      addToCart);
router.put('/:id',    updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
