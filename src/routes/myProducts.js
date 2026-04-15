const router = require('express').Router();
const { getMyProducts } = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/products', auth, getMyProducts);

module.exports = router;
