import mongoose from 'mongoose';

const trackingEventSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  status: { type: String, enum: ['departed', 'arrived_hub', 'delay', 'in_transit', 'delivered'], required: true },
  location: { type: String },
  notes: { type: String },
  occurredAt: { type: Date, default: Date.now }
});

trackingEventSchema.index({ booking: 1, occurredAt: 1 });

export const TrackingEvent = mongoose.model('TrackingEvent', trackingEventSchema);
