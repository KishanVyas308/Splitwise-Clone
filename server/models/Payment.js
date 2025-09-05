const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
