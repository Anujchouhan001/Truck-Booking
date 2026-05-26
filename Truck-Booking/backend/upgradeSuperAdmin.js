// Script to upgrade existing admin to superadmin
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const upgradeSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/truck_booking');
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@trucksuvidha.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Please run "npm run create-admin" first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if already superadmin
    if (adminUser.role === 'superadmin') {
      console.log('✅ User is already a SuperAdmin!');
      console.log('📧 Email: admin@trucksuvidha.com');
      console.log('👤 Role: superadmin');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Upgrade to superadmin
    adminUser.role = 'superadmin';
    adminUser.name = 'SuperAdmin';
    await adminUser.save();

    console.log('✅ User upgraded to SuperAdmin successfully!');
    console.log('📧 Email: admin@trucksuvidha.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: superadmin');
    console.log('\n⚠️  Please logout and login again for changes to take effect.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error upgrading user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

upgradeSuperAdmin();
