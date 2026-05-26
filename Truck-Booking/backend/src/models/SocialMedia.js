import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true,
    default: 'link' // Default icon type
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('SocialMedia', socialMediaSchema);
