const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  _id: user._id, name: user.name, email: user.email, role: user.role
});

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return error(res, 409, 'An account with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role: 'customer' });
  const token = generateToken(user);

  return success(res, 201, 'Registration successful', { token, user: sanitizeUser(user) });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) return error(res, 401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return error(res, 401, 'Invalid email or password');

  const token = generateToken(user);
  return success(res, 200, 'Login successful', { token, user: sanitizeUser(user) });
});

const getMe = catchAsync(async (req, res) => {
  return success(res, 200, 'Current user retrieved', { user: sanitizeUser(req.user) });
});

module.exports = { register, login, getMe };
