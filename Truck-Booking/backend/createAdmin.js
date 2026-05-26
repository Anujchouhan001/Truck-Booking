// Script to create an admin user
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Select MongoDB URI based on DB_MODE
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

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(getMongoURI());
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@trucksuvidha.com' });
    if (existingAdmin) {
      // Upgrade to superadmin if not already
      if (existingAdmin.role !== 'superadmin') {
        existingAdmin.role = 'superadmin';
        await existingAdmin.save();
        console.log('✅ Existing admin upgraded to superadmin!');
      } else {
        console.log('Admin user already exists as superadmin!');
      }
      console.log('📧 Email: admin@trucksuvidha.com');
      console.log('🔑 Password: Admin@123');
      console.log('👤 Role: superadmin');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password-
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const adminUser = new User({
      name: 'SuperAdmin',
      email: 'admin@trucksuvidha.com',
      passwordHash: hashedPassword,
      role: 'superadmin'
    });

    await adminUser.save();
    console.log('✅ SuperAdmin user created successfully!');
    console.log('📧 Email: admin@trucksuvidha.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: superadmin');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminUser();
