const { Product, Category } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getProducts = catchAsync(async (req, res) => {
  const {
    search, category, minPrice, maxPrice, inStock,
    sort = 'createdAt', order = 'desc', page = 1, limit = 12
  } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const allowedSort = ['createdAt', 'price', 'name', 'stock'];
  const sortField = allowedSort.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
  const skipNum = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name')
      .sort({ [sortField]: sortOrder }).skip(skipNum).limit(limitNum),
    Product.countDocuments(filter)
  ]);

  return success(res, 200, 'Products retrieved', items, {
    total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum)
  });
});

const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return error(res, 404, 'Product not found');
  return success(res, 200, 'Product retrieved', product);
});

const createProduct = catchAsync(async (req, res) => {
  const { category, name, description, price, stock, image_url } = req.body;
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) return error(res, 400, 'Invalid category: category does not exist');

  const product = await Product.create({ category, name, description, price, stock: stock ?? 0, image_url });
  return success(res, 201, 'Product created', product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, 404, 'Product not found');

  const { category, name, description, price, stock, image_url } = req.body;
  if (category) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) return error(res, 400, 'Invalid category: category does not exist');
    product.category = category;
  }
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (image_url !== undefined) product.image_url = image_url;

  await product.save();
  return success(res, 200, 'Product updated', product);
});

const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, 404, 'Product not found');
  await product.deleteOne();
  return success(res, 200, 'Product deleted');
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
