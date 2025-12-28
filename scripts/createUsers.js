// Script to create default users
// Run with: node scripts/createUsers.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

const defaultUsers = [
  {
    username: 'tripura_mandavkar',
    password: 'tripura123',
    role: 'viewer'
  },
  {
    username: 'Pratham',
    password: 'pratham123',
    role: 'sender'
  }
];

async function createUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const userData of defaultUsers) {
      const existing = await User.findOne({ username: userData.username });

      if (existing) {
        console.log(`⏭️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('\n✅ All users created successfully!');
    console.log('\nDefault credentials:');
    console.log('1. Viewer: tripura_mandavkar / tripura123');
    console.log('2. Sender: Pratham / pratham123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUsers();
