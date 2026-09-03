const { Order, Product, User } = require('../models');
const { success } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, pendingOrders, lowStockProducts, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ])
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  return success(res, 200, 'Dashboard stats retrieved', {
    totalOrders, totalProducts, totalUsers, pendingOrders, lowStockProducts, totalRevenue
  });
});

module.exports = { getDashboardStats };
