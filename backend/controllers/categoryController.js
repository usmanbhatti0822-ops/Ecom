const { Category, Product } = require('../models');
const { success, error } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const withCounts = await Promise.all(categories.map(async (c) => {
    const productCount = await Product.countDocuments({ category: c._id });
    return { ...c, productCount };
  }));
  return success(res, 200, 'Categories retrieved', withCounts);
});

const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, 404, 'Category not found');
  const products = await Product.find({ category: category._id });
  return success(res, 200, 'Category retrieved', { ...category.toObject(), products });
});

const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const existing = await Category.findOne({ name });
  if (existing) return error(res, 409, 'A category with this name already exists');
  const category = await Category.create({ name, description });
  return success(res, 201, 'Category created', category);
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, 404, 'Category not found');

  const { name, description } = req.body;
  if (name && name !== category.name) {
    const existing = await Category.findOne({ name, _id: { $ne: category._id } });
    if (existing) return error(res, 409, 'A category with this name already exists');
  }

  category.name = name ?? category.name;
  category.description = description ?? category.description;
  await category.save();
  return success(res, 200, 'Category updated', category);
});

const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return error(res, 404, 'Category not found');

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return error(res, 400, `Cannot delete category with ${productCount} product(s) still assigned to it`);
  }

  await category.deleteOne();
  return success(res, 200, 'Category deleted');
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
