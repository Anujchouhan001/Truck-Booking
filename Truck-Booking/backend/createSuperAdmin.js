// Script to create a SuperAdmin user for Dharmendra Chouhan
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

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(getMongoURI());
    console.log('Connected to MongoDB');

    const name = 'Dharmendra Chouhan';
    const email = 'chouhantaxhelp@gmail.com';
    const password = 'Dharmendra@SomyaTruckServices$$Web';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      // Update to superadmin if not already
      if (existingUser.role !== 'superadmin') {
        existingUser.role = 'superadmin';
        existingUser.name = name;
        // Update password
        existingUser.passwordHash = await bcrypt.hash(password, 10);
        await existingUser.save();
        console.log('✅ Existing user upgraded to SuperAdmin!');
      } else {
        console.log('User already exists as SuperAdmin!');
      }
      console.log('👤 Name:', name);
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👨‍💼 Role: SuperAdmin');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create SuperAdmin user
    const superAdmin = new User({
      name: name,
      email: email,
      passwordHash: hashedPassword,
      role: 'superadmin'
    });

    await superAdmin.save();
    console.log('✅ SuperAdmin created successfully!');
    console.log('👤 Name:', name);
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👨‍💼 Role: SuperAdmin');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating SuperAdmin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSuperAdmin();
