const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, 'category is required'] },
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  stock: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
  image_url: {
    // Not in the minimal ERD field list; added so the frontend has something
    // to render for product cards. Documented in README.
    type: String, trim: true, default: ''
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
