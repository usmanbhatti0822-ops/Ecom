const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentStatusHistorySchema = new Schema({
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'], required: true },
  note: { type: String, trim: true, default: '' },
  changed_at: { type: Date, default: Date.now },
  changed_by: { type: String, trim: true, default: '' }
}, { timestamps: false });

paymentStatusHistorySchema.index({ payment: 1, changed_at: 1 });

module.exports = mongoose.model('PaymentStatusHistory', paymentStatusHistorySchema);
