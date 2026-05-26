import 'dotenv/config';
import mongoose from 'mongoose';
import SocialMedia from './src/models/SocialMedia.js';

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

const defaultSocialMedia = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/trucksuvidha',
    icon: 'facebook',
    isActive: true,
    order: 1
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/trucksuvidha',
    icon: 'twitter',
    isActive: true,
    order: 2
  },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/company/trucksuvidha',
    icon: 'linkedin',
    isActive: true,
    order: 3
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/trucksuvidha',
    icon: 'instagram',
    isActive: true,
    order: 4
  },
  {
    platform: 'youtube',
    url: 'https://youtube.com/@trucksuvidha',
    icon: 'youtube',
    isActive: true,
    order: 5
  }
];

async function seedSocialMedia() {
  try {
    const mongoURI = getMongoURI();
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check existing social media entries
    const existingCount = await SocialMedia.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️ Found ${existingCount} existing social media entries.`);
      const answer = process.argv.includes('--force');
      
      if (answer) {
        console.log('🗑️ Deleting existing entries (--force flag used)...');
        await SocialMedia.deleteMany({});
      } else {
        console.log('ℹ️ Use --force flag to replace existing entries.');
        console.log('✅ Keeping existing social media entries.');
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Insert default social media
    for (const sm of defaultSocialMedia) {
      const existing = await SocialMedia.findOne({ platform: sm.platform });
      if (!existing) {
        await SocialMedia.create(sm);
        console.log(`✅ Created: ${sm.platform}`);
      } else {
        console.log(`ℹ️ Already exists: ${sm.platform}`);
      }
    }

    console.log('✅ Social media seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding social media:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSocialMedia();
