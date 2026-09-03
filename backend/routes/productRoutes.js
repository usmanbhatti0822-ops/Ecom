const express = require('express');
const { body } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

const productValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('category must be a valid id'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

router.post('/', protect, requireRole('admin'), productValidators, validate, createProduct);
router.put('/:id', protect, requireRole('admin'), validate, updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;
