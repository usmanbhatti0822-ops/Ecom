const bcrypt = require('bcryptjs');
const { User, Order } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getProfile = catchAsync(async (req, res) => {
  return success(res, 200, 'Profile retrieved', req.user);
});

const updateProfile = catchAsync(async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (password) {
    if (password.length < 6) return error(res, 400, 'Password must be at least 6 characters');
    user.password = await bcrypt.hash(password, 12);
  }
  await user.save();

  const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };
  return success(res, 200, 'Profile updated', safeUser);
});

const getUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return success(res, 200, 'Users retrieved', users);
});

const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return error(res, 404, 'User not found');
  const orders = await Order.find({ user: user._id });
  return success(res, 200, 'User retrieved', { ...user.toObject(), orders });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'admin'].includes(role)) return error(res, 400, 'role must be either "customer" or "admin"');

  const user = await User.findById(req.params.id);
  if (!user) return error(res, 404, 'User not found');

  user.role = role;
  await user.save();
  return success(res, 200, 'User role updated', user);
});

module.exports = { getProfile, updateProfile, getUsers, getUser, updateUserRole };
