const express = require('express');
const { body } = require('express-validator');
const { getRefunds, createRefund, updateRefund } = require('../controllers/refundController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/', getRefunds);
router.post('/', [
  body('payment_id').isMongoId().withMessage('payment_id must be a valid id'),
  body('amount').isFloat({ min: 0.01 }).withMessage('amount must be greater than 0')
], validate, createRefund);
router.put('/:id', [body('refund_status').isIn(['pending', 'completed', 'failed'])], validate, updateRefund);

module.exports = router;
