import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  name: { type: String },
  role: { type: String, enum: ['customer', 'admin', 'driver', 'superadmin'], default: 'customer', index: true },

  googleId: { type: String, unique: true, sparse: true, index: true },
  avatar: { type: String }, 
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ authProvider: 1, email: 1 });

export const User = mongoose.model('User', userSchema);
