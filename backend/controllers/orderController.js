const mongoose = require('mongoose');
const { Order, OrderItem, Product, Payment, PaymentStatusHistory } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

// POST /api/orders
// Creates Order + OrderItems + Payment + initial PaymentStatusHistory
// atomically. Uses a Mongo session transaction when the server is a
// replica set; falls back to a sequential (non-transactional) path
// otherwise, so the app still works against a plain standalone mongod
// (common in local dev) - documented in README.
const createOrder = catchAsync(async (req, res) => {
  const { items, shipping_address, payment_method } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(items) || items.length === 0) {
    return error(res, 400, 'Order must contain at least one item');
  }

  const allowedMethods = ['cod', 'card', 'stripe', 'jazzcash', 'easypaisa'];
  if (!allowedMethods.includes(payment_method)) {
    return error(res, 400, 'Invalid payment_method');
  }

  async function runOrderCreation(session) {
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      if (!product_id || !quantity || quantity < 1) {
        throw Object.assign(new Error('Each item requires a valid product_id and quantity >= 1'), { statusCode: 400 });
      }

      const product = session ? await Product.findById(product_id).session(session) : await Product.findById(product_id);
      if (!product) {
        throw Object.assign(new Error(`Product with id ${product_id} not found`), { statusCode: 404 });
      }
      if (product.stock < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`),
          { statusCode: 400 }
        );
      }

      const currentPrice = product.price;
      total += currentPrice * quantity;
      orderItemsData.push({ product_id: product._id, quantity, price: currentPrice, name: product.name });

      const updateResult = await Product.updateOne(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        session ? { session } : {}
      );
      if (updateResult.modifiedCount === 0) {
        throw Object.assign(
          new Error(`Stock for "${product.name}" changed before checkout completed. Please try again.`),
          { statusCode: 409 }
        );
      }
    }

    total = Math.round(total * 100) / 100;

    const orderDoc = { user: userId, order_date: new Date(), total_amount: total, status: 'pending', shipping_address: shipping_address || '' };
    const order = session
      ? (await Order.create([orderDoc], { session }))[0]
      : await Order.create(orderDoc);

    const itemsWithOrderId = orderItemsData.map(i => ({ order: order._id, product: i.product_id, quantity: i.quantity, price: i.price }));
    if (session) await OrderItem.insertMany(itemsWithOrderId, { session });
    else await OrderItem.insertMany(itemsWithOrderId);

    const paymentDoc = { order: order._id, amount: total, payment_method, payment_status: 'pending', transaction_id: null, paid_at: null };
    const payment = session
      ? (await Payment.create([paymentDoc], { session }))[0]
      : await Payment.create(paymentDoc);

    const historyDoc = { payment: payment._id, status: 'pending', note: 'Payment record created at checkout', changed_at: new Date(), changed_by: req.user.email };
    if (session) await PaymentStatusHistory.create([historyDoc], { session });
    else await PaymentStatusHistory.create(historyDoc);

    return order._id;
  }

  let createdOrderId;
  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => {
        createdOrderId = await runOrderCreation(session);
      });
    } catch (txErr) {
      // Standalone mongod (no replica set) doesn't support transactions.
      // Fall back to a best-effort sequential path so the app still works
      // in simple local/dev setups.
      if (txErr.message && (txErr.message.includes('Transaction numbers') || txErr.message.includes('replica set'))) {
        createdOrderId = await runOrderCreation(null);
      } else {
        throw txErr;
      }
    }
  } finally {
    await session.endSession();
  }

  const fullOrder = await Order.findById(createdOrderId).populate('user', 'name email');
  const orderItems = await OrderItem.find({ order: createdOrderId }).populate('product');
  const payment = await Payment.findOne({ order: createdOrderId });

  return success(res, 201, 'Order placed successfully', { ...fullOrder.toObject(), items: orderItems, payment });
});

const getOrders = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin && req.query.all === 'true' ? {} : { user: req.user._id };
  if (isAdmin && req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });

  const ordersWithDetails = await Promise.all(orders.map(async (order) => {
    const items = await OrderItem.find({ order: order._id }).populate('product');
    const payment = await Payment.findOne({ order: order._id });
    return { ...order.toObject(), items, payment };
  }));

  return success(res, 200, 'Orders retrieved', ordersWithDetails);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return error(res, 404, 'Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return error(res, 403, 'You do not have permission to view this order');

  const items = await OrderItem.find({ order: order._id }).populate('product');
  const payment = await Payment.findOne({ order: order._id });

  let statusHistory = [];
  let refunds = [];
  if (payment) {
    statusHistory = await PaymentStatusHistory.find({ payment: payment._id }).sort({ changed_at: 1 });
    const { Refund } = require('../models');
    refunds = await Refund.find({ payment: payment._id });
  }

  return success(res, 200, 'Order retrieved', {
    ...order.toObject(), items, payment: payment ? { ...payment.toObject(), statusHistory, refunds } : null
  });
});

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'], delivered: [], cancelled: []
};

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, 'Order not found');

  const allowedNext = VALID_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    return error(res, 400, `Cannot transition order from "${order.status}" to "${status}"`);
  }

  order.status = status;
  await order.save();
  return success(res, 200, 'Order status updated', order);
});


const cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return error(res, 404, 'Order not found');
  }

  // Customer sirf apna order cancel kar sakta hai
  const isOwner =
    order.user.toString() === req.user._id.toString();

  if (!isOwner) {
    return error(
      res,
      403,
      'You can only cancel your own order'
    );
  }

  // Sirf pending aur confirmed orders cancel honge
  if (!['pending', 'confirmed'].includes(order.status)) {
    return error(
      res,
      400,
      `Order cannot be cancelled when status is "${order.status}"`
    );
  }

  // Order ke items nikalo
  const orderItems = await OrderItem.find({
    order: order._id
  });

  // Stock restore karo
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity
        }
      }
    );
  }

  // Order cancel
  order.status = 'cancelled';
  await order.save();

  // Payment check
  const payment = await Payment.findOne({
    order: order._id
  });

  let refund = null;

  // Agar payment already paid hai to refund request create hogi
  if (payment && payment.payment_status === 'paid') {
    const { Refund } = require('../models');

    refund = await Refund.create({
      payment: payment._id,
      amount: payment.amount,
      reason: 'Customer cancelled the order',
      refund_status: 'pending'
    });

    await PaymentStatusHistory.create({
      payment: payment._id,
      status: 'partial_refund',
      note:
        'Customer cancelled the order. Full refund request created.',
      changed_at: new Date(),
      changed_by: req.user.email
    });
  }

  // Agar payment pending hai
  else if (payment) {
    await PaymentStatusHistory.create({
      payment: payment._id,
      status: payment.payment_status,
      note: 'Order cancelled by customer before payment completion',
      changed_at: new Date(),
      changed_by: req.user.email
    });
  }

  return success(
    res,
    200,
    'Order cancelled successfully',
    {
      order,
      refund
    }
  );
});

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder };
