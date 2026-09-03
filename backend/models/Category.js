const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: [true, 'Category name is required'], unique: true, trim: true },
  description: { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
