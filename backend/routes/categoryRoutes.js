const express = require('express');
const { body } = require('express-validator');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post('/', protect, requireRole('admin'), [body('name').trim().notEmpty().withMessage('Category name is required')], validate, createCategory);
router.put('/:id', protect, requireRole('admin'), [body('name').optional().trim().notEmpty()], validate, updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

module.exports = router;
