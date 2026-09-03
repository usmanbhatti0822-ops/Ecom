const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], validate, register);

router.post('/login', [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], validate, login);

router.get('/me', protect, getMe);

module.exports = router;
