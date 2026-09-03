const { error } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return error(res, 404, `Route not found: ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with this ${field} already exists` : 'Duplicate value error';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return error(res, statusCode, message);
};

module.exports = { notFound, errorHandler };
