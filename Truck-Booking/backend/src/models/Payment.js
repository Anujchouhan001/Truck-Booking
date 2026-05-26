import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, sparse: true, index: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentType: {
    type: String,
    enum: ['booking_fee', 'final_payment'],
    default: 'booking_fee'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },

  feeBreakdown: {
    baseFee: { type: Number },
    weightFee: { type: Number },
    materialFee: { type: Number },
    truckTypeFee: { type: Number },
    totalFee: { type: Number }
  },

  loadDetails: {
    type: { type: String },
    sourceCity: { type: String },
    destinationCity: { type: String },
    material: { type: String },
    weightMT: { type: Number },
    truckType: { type: String },
    trucksRequired: { type: Number },
    scheduledDate: { type: Date }
  },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', sparse: true },

  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String }
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
