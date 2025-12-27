const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const reelRoutes = require('./routes/reelRoutes');
const authRoutes = require('./routes/authRoutes');
const sharedReelRoutes = require('./routes/sharedReelRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/reel', reelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shared-reels', sharedReelRoutes);
app.use('/api/debug', debugRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'OK',
    message: 'Instagram Reel Viewer API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  Instagram Reel Viewer API (Educational)      ║
║  Server running on port ${PORT}                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
