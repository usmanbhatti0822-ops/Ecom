const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../models');
const { error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return error(res, 401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return error(res, 401, 'Not authorized, invalid or expired token');
  }

  if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
    return error(res, 401, 'Not authorized, invalid token payload');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return error(res, 401, 'Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return error(res, 403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, requireRole };
