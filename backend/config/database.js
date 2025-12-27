const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-reel-viewer', {
      // No need for useNewUrlParser and useUnifiedTopology in Mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't exit process - allow app to run without database for basic functionality
    console.warn('⚠️  Running without database - user features disabled');
  }
};

module.exports = connectDB;
