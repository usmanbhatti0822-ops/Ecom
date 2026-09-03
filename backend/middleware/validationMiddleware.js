const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 400, 'Validation failed', errors.array().map(e => ({
      field: e.path,
      message: e.msg
    })));
  }
  next();
};

module.exports = validate;
