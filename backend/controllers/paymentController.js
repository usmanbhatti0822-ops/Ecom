const crypto = require('crypto');
const mongoose = require('mongoose');
const { Payment, PaymentStatusHistory, Order } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

function simulateGatewayCharge(method) {
  const ok = method === 'cod' ? true : Math.random() > 0.1;
  return { success: ok, transaction_id: `${method.toUpperCase()}-${crypto.randomBytes(6).toString('hex')}` };
}

const getPaymentByOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return error(res, 404, 'Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return error(res, 403, 'You do not have permission to view this payment');

  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return error(res, 404, 'Payment not found for this order');

  const statusHistory = await PaymentStatusHistory.find({ payment: payment._id }).sort({ changed_at: 1 });
  return success(res, 200, 'Payment retrieved', { ...payment.toObject(), statusHistory });
});

const processPayment = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return error(res, 404, 'Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return error(res, 403, 'You do not have permission to process this payment');

  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return error(res, 404, 'Payment not found for this order');
  if (payment.payment_status === 'paid') return error(res, 400, 'This payment has already been completed');

  async function run(session) {
    if (payment.payment_method === 'cod') {
      payment.payment_status = 'pending';
      await payment.save(session ? { session } : undefined);
      const doc = { payment: payment._id, status: 'pending', note: 'Cash on Delivery selected - will be collected upon delivery', changed_at: new Date(), changed_by: req.user.email };
      session ? await PaymentStatusHistory.create([doc], { session }) : await PaymentStatusHistory.create(doc);
      return;
    }

    const gatewayResult = simulateGatewayCharge(payment.payment_method);
    if (gatewayResult.success) {
      payment.payment_status = 'paid';
      payment.transaction_id = gatewayResult.transaction_id;
      payment.paid_at = new Date();
      await payment.save(session ? { session } : undefined);

      const doc = { payment: payment._id, status: 'paid', note: `Payment completed via ${payment.payment_method} (demo gateway)`, changed_at: new Date(), changed_by: req.user.email };
      session ? await PaymentStatusHistory.create([doc], { session }) : await PaymentStatusHistory.create(doc);

      order.status = 'confirmed';
      await order.save(session ? { session } : undefined);
    } else {
      payment.payment_status = 'failed';
      await payment.save(session ? { session } : undefined);
      const doc = { payment: payment._id, status: 'failed', note: `Payment failed via ${payment.payment_method} (demo gateway)`, changed_at: new Date(), changed_by: req.user.email };
      session ? await PaymentStatusHistory.create([doc], { session }) : await PaymentStatusHistory.create(doc);
    }
  }

  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => { await run(session); });
    } catch (txErr) {
      if (txErr.message && (txErr.message.includes('Transaction numbers') || txErr.message.includes('replica set'))) {
        await run(null);
      } else {
        throw txErr;
      }
    }
  } finally {
    await session.endSession();
  }

  const refreshed = await Payment.findById(payment._id);
  return success(res, 200, `Payment ${refreshed.payment_status}`, refreshed);
});

module.exports = { getPaymentByOrder, processPayment };
