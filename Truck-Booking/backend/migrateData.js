import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Truck } from './src/models/Truck.js';
import { Load } from './src/models/Load.js';
import { Booking } from './src/models/Booking.js';
import { Quote } from './src/models/Quote.js';
import { Inquiry } from './src/models/Inquiry.js';
import { TrackingEvent } from './src/models/TrackingEvent.js';
import { Notification } from './src/models/Notification.js';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/truck_booking';
const REMOTE_URI = process.argv[2];

if (!REMOTE_URI) {
  console.error('❌ Please provide the MongoDB Atlas connection string as an argument.');
  console.error('Usage: node migrateData.js "mongodb+srv://..."');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Fetch data from Local DB
  console.log('📦 Reading from Local Database...');
  await mongoose.connect(LOCAL_URI);
  
  const users = await User.find({});
  const trucks = await Truck.find({});
  const loads = await Load.find({});
  const bookings = await Booking.find({});
  const quotes = await Quote.find({});
  const inquiries = await Inquiry.find({});
  const tracking = await TrackingEvent.find({});
  const notifications = await Notification.find({});

  console.log(`   Found: ${users.length} users, ${trucks.length} trucks, ${loads.length} loads`);
  await mongoose.disconnect();

  // 2. Write data to Remote DB (Atlas)
  console.log('☁️  Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(REMOTE_URI);
    console.log('✅ Connected to Atlas.');

    // Optional: Clear existing data in Atlas to avoid duplicates? 
    // For safety, let's just try to insert and catch errors, or use bulkWrite for upsert.
    // For simplicity in this "do everything" script, we'll wipe and replace to ensure exact copy.
    // WARNING: This deletes production data.
    
    console.log('🧹 Clearing existing data in Atlas...');
    await User.deleteMany({});
    await Truck.deleteMany({});
    await Load.deleteMany({});
    await Booking.deleteMany({});
    await Quote.deleteMany({});
    await Inquiry.deleteMany({});
    await TrackingEvent.deleteMany({});
    await Notification.deleteMany({});

    console.log('💾 Writing data to Atlas...');
    if (users.length) await User.insertMany(users);
    if (trucks.length) await Truck.insertMany(trucks);
    if (loads.length) await Load.insertMany(loads);
    if (bookings.length) await Booking.insertMany(bookings);
    if (quotes.length) await Quote.insertMany(quotes);
    if (inquiries.length) await Inquiry.insertMany(inquiries);
    if (tracking.length) await TrackingEvent.insertMany(tracking);
    if (notifications.length) await Notification.insertMany(notifications);

    console.log('✅ Migration Complete! Your local data is now on the cloud.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
