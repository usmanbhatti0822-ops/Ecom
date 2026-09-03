const express = require('express');
const { body } = require('express-validator');
const { getPaymentByOrder, processPayment } = require('../controllers/paymentController');
const { getHistory, addStatusChange } = require('../controllers/paymentStatusController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/order/:orderId', getPaymentByOrder);
router.post('/order/:orderId/process', processPayment);

router.get('/:paymentId/history', getHistory);
router.post('/:paymentId/history', requireRole('admin'), [
  body('status').isIn(['pending', 'paid', 'failed', 'refunded', 'partial_refund'])
], validate, addStatusChange);

module.exports = router;
