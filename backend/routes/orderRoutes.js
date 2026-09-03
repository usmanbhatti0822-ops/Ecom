const express = require('express');
const { body } = require('express-validator');
const { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('payment_method').isIn(['cod', 'card', 'stripe', 'jazzcash', 'easypaisa'])
], validate, createOrder);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);
router.put('/:id/status', requireRole('admin'), [body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])], validate, updateOrderStatus);


module.exports = router;
