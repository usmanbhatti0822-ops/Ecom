const { Payment, Refund, PaymentStatusHistory } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getRefunds = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.paymentId) filter.payment = req.query.paymentId;
  const refunds = await Refund.find(filter).populate('payment').sort({ createdAt: -1 });
  return success(res, 200, 'Refunds retrieved', refunds);
});

const createRefund = catchAsync(async (req, res) => {
  const { payment_id, amount, reason } = req.body;
  const payment = await Payment.findById(payment_id);
  if (!payment) return error(res, 404, 'Payment not found');

  if (payment.payment_status !== 'paid' && payment.payment_status !== 'refunded') {
    return error(res, 400, 'Only paid payments can be refunded');
  }
  if (amount <= 0) return error(res, 400, 'Refund amount must be greater than 0');

  const existingRefunds = await Refund.find({ payment: payment._id, refund_status: 'completed' });
  const alreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);

  if (alreadyRefunded + Number(amount) > payment.amount) {
    return error(res, 400, `Refund amount exceeds remaining refundable balance of ${(payment.amount - alreadyRefunded).toFixed(2)}`);
  }

  const refund = await Refund.create({ payment: payment._id, amount, reason: reason || '', refund_status: 'pending' });

  await PaymentStatusHistory.create({
    payment: payment._id, status: 'partial_refund',
    note: `Refund of ${amount} requested: ${reason || 'no reason given'}`,
    changed_at: new Date(), changed_by: req.user.email
  });

  return success(res, 201, 'Refund requested', refund);
});

const updateRefund = catchAsync(async (req, res) => {
  const { refund_status } = req.body;
  const allowed = ['pending', 'completed', 'failed'];
  if (!allowed.includes(refund_status)) {
    return error(res, 400, `Invalid refund_status. Must be one of: ${allowed.join(', ')}`);
  }

  const refund = await Refund.findById(req.params.id).populate('payment');
  if (!refund) return error(res, 404, 'Refund not found');

  refund.refund_status = refund_status;
  if (refund_status === 'completed') refund.refunded_at = new Date();
  await refund.save();

  if (refund_status === 'completed') {
    const completedRefunds = await Refund.find({ payment: refund.payment._id, refund_status: 'completed' });
    const totalCompleted = completedRefunds.reduce((sum, r) => sum + r.amount, 0);
    const fullyRefunded = totalCompleted >= refund.payment.amount;

    if (fullyRefunded) {
      await Payment.findByIdAndUpdate(refund.payment._id, { payment_status: 'refunded' });
    }

    await PaymentStatusHistory.create({
      payment: refund.payment._id, status: fullyRefunded ? 'refunded' : 'partial_refund',
      note: `Refund #${refund._id} marked completed (${refund.amount})`,
      changed_at: new Date(), changed_by: req.user.email
    });
  } else {
    await PaymentStatusHistory.create({
      payment: refund.payment._id, status: refund_status === 'failed' ? 'paid' : 'partial_refund',
      note: `Refund #${refund._id} marked ${refund_status}`,
      changed_at: new Date(), changed_by: req.user.email
    });
  }

  const updated = await Refund.findById(refund._id).populate('payment');
  return success(res, 200, 'Refund updated', updated);
});

module.exports = { getRefunds, createRefund, updateRefund };
