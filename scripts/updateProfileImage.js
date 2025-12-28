import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Import User model
import User from '../lib/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tripura_mandavkar:tripuraholic@cluster0.1u52nd6.mongodb.net/instagram-reel-viewer?retryWrites=true&w=majority';

async function updateProfileImage() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update tripura_mandavkar's profile
    const username = 'tripura_mandavkar';
    const profileImageUrl = '/tripura-profile.png'; // Path relative to public folder

    console.log(`📝 Updating profile image for ${username}...`);

    const user = await User.findOneAndUpdate(
      { username },
      { profileImage: profileImageUrl },
      { new: true }
    );

    if (user) {
      console.log(`✅ Successfully updated profile image for ${username}`);
      console.log(`Profile image URL: ${user.profileImage}`);
    } else {
      console.log(`❌ User ${username} not found`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateProfileImage();
