const { Payment, PaymentStatusHistory } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const VALID_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partial_refund'];

const getHistory = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return error(res, 404, 'Payment not found');
  const history = await PaymentStatusHistory.find({ payment: req.params.paymentId }).sort({ changed_at: 1 });
  return success(res, 200, 'Payment status history retrieved', history);
});

const addStatusChange = catchAsync(async (req, res) => {
  const { status, note } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return error(res, 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return error(res, 404, 'Payment not found');

  await PaymentStatusHistory.create({
    payment: payment._id, status, note: note || '', changed_at: new Date(), changed_by: req.user.email
  });

  if (status !== 'partial_refund') {
    payment.payment_status = status;
    await payment.save();
  }

  const updatedHistory = await PaymentStatusHistory.find({ payment: payment._id }).sort({ changed_at: 1 });
  return success(res, 201, 'Payment status change recorded', updatedHistory);
});

module.exports = { getHistory, addStatusChange };
