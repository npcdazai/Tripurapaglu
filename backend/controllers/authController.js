const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password || !role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username, password, and role are required'
      });
    }

    if (!['sender', 'viewer'].includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Role must be either "sender" or "viewer"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      role
    });

    // Generate token
    const token = generateToken(user._id, user.username, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to register user'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.username, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to login'
    });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
