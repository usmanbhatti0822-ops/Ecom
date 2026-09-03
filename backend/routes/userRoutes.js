const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, getUsers, getUser, updateUserRole } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty(),
  body('password').optional().isLength({ min: 6 })
], validate, updateProfile);

router.get('/', protect, requireRole('admin'), getUsers);
router.get('/:id', protect, requireRole('admin'), getUser);
router.put('/:id/role', protect, requireRole('admin'), [body('role').isIn(['customer', 'admin'])], validate, updateUserRole);

module.exports = router;
