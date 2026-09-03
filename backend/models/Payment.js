const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, // enforces Order 1:1 Payment
  amount: { type: Number, required: true, min: 0 },
  payment_method: { type: String, enum: ['cod', 'card', 'stripe', 'jazzcash', 'easypaisa'], required: true },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  transaction_id: { type: String, unique: true, sparse: true },
  paid_at: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
