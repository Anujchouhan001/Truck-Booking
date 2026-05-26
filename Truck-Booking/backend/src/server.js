import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 4000;

function getMongoURI() {
  const mode = process.env.DB_MODE || 'local';
  
  if (mode === 'atlas') {
    console.log('📡 Using MongoDB Atlas (Cloud)');
    return process.env.MONGODB_ATLAS;
  } else {
    console.log('💻 Using MongoDB Local (Compass)');
    return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/truck_booking';
  }
}

async function start() {
  const preferredURI = getMongoURI();
  const fallbackURI = process.env.DB_MODE === 'atlas'
    ? (process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/truck_booking')
    : process.env.MONGODB_ATLAS;

  const connected = await connectDB(preferredURI);

  if (!connected && process.env.NODE_ENV !== 'production' && fallbackURI && fallbackURI !== preferredURI) {
    console.warn('⚠️ Primary MongoDB connection failed. Falling back to local MongoDB for development.');
    await connectDB(fallbackURI);
  }

  if (!connected && process.env.NODE_ENV === 'production') {
    console.error('Unable to connect to MongoDB in production. Exiting server startup.');
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

start();
