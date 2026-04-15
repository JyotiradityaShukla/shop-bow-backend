const router = require('express').Router();
const { placeOrder, getOrderById } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/',    placeOrder);
router.get('/:id',  getOrderById);

module.exports = router;
