const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: {
    // Historical price at time of purchase - never re-derived from Product
    type: Number, required: true, min: 0
  }
}, { timestamps: true });

orderItemSchema.index({ order: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
