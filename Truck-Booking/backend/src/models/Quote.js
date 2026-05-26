import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  load: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
    index: true
  },
  transporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  message: {
    type: String
  },
  estimatedDeliveryDays: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  responseNote: {
    type: String
  }
});

// Ensure a transporter can only submit one quote per load
quoteSchema.index({ load: 1, transporter: 1 }, { unique: true });

export const Quote = mongoose.model('Quote', quoteSchema);
