const mongoose = require('mongoose');
const { Schema } = mongoose;

const refundSchema = new Schema({
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, trim: true, default: '' },
  refund_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  refunded_at: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
