const router = require('express').Router();
const {
  getProducts,
  getProductById,
  createProduct,
  getCategories,
} = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/',           getProducts);
router.get('/categories', getCategories);
router.get('/:id',        getProductById);
router.post('/',          auth, createProduct);

module.exports = router;
