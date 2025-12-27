const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user (sender or viewer)
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
