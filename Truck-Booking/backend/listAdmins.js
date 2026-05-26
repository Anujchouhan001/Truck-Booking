// Script to list all SuperAdmin users
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

function getMongoURI() {
  const mode = process.env.DB_MODE || 'local';
  if (mode === 'atlas') {
    return process.env.MONGODB_ATLAS;
  } else {
    return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/truck_booking';
  }
}

const listAdmins = async () => {
  try {
    await mongoose.connect(getMongoURI());
    console.log('📡 Connected to MongoDB Atlas\n');

    const admins = await User.find({ role: 'superadmin' }).select('name email role createdAt');
    
    console.log('👥 SuperAdmin Users:');
    console.log('==========================================');
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👨‍💼 Role: ${admin.role}`);
      console.log(`   📅 Created: ${admin.createdAt}`);
    });
    console.log('\n==========================================');
    console.log(`Total SuperAdmins: ${admins.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listAdmins();
