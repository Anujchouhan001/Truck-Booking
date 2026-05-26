import mongoose from 'mongoose';

const loadSchema = new mongoose.Schema({
  type: { type: String, enum: ['full', 'part'], required: true },
  sourceCity: { type: String, required: true, index: true },
  destinationCity: { type: String, required: true, index: true },
  material: { type: String, required: true },
  weightMT: { type: Number },
  truckType: { type: String },
  trucksRequired: { type: Number, default: 1 },
  scheduledDate: { type: Date, required: true, index: true },
  status: {
    type: String,
    enum: ['open', 'quoted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'],
    default: 'open',
    index: true
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Driver assigned
  acceptedQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  acceptedQuoteAmount: { type: Number }, // The driver's quoted price that was accepted
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', sparse: true },
  finalPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', sparse: true }, // Payment after delivery
  bookingFee: { type: Number },
  // Additional details
  pickupAddress: { type: String },
  deliveryAddress: { type: String },
  contactPhone: { type: String },
  notes: { type: String },
  // Status history for tracking
  statusHistory: [{
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String }
  }],
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

loadSchema.index({ sourceCity: 1, destinationCity: 1, scheduledDate: 1 });

export const Load = mongoose.model('Load', loadSchema);
