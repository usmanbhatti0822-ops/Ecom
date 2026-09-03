const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 100 },
  email: {
    type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: { type: String, required: [true, 'Password is required'], select: false },
  role: {
    // NOTE: `role` is not part of the original minimal ERD field list. Added
    // because admin functionality requires distinguishing admins from customers.
    type: String, enum: ['customer', 'admin'], default: 'customer'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
