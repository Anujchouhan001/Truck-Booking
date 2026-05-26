import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  if (!uri) {
    console.error('Missing MONGODB_URI environment variable');
    return false;
  }
  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000
    });
    return true;
  } catch (err) {
    console.error('MongoDB connection failure:', err.message);
    return false;
  }
}

export { mongoose };
