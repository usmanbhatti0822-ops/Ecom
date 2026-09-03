const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_date: { type: Date, default: Date.now },
  total_amount: { type: Number, required: true, min: 0 },
  status: {
    type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending'
  },
  shipping_address: {
    // Added so checkout can capture where to ship; required for a working
    // checkout flow though not in the ERD's minimal field list.
    type: String, trim: true, default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
