import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  handled: { type: Boolean, default: false }
});

inquirySchema.index({ email: 1, createdAt: 1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
