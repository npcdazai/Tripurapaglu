const express = require('express');
const router = express.Router();
const { fetchReel, validateReelUrl } = require('../controllers/reelController');

/**
 * POST /api/reel
 * Fetch Instagram Reel metadata and video URL
 *
 * Request body:
 * {
 *   "url": "https://www.instagram.com/reel/XXXXX/"
 * }
 *
 * Response:
 * Success: { type: "video", videoUrl: "...", thumbnail: "...", ... }
 * Error: { error: "..." }
 */
router.post('/', validateReelUrl, fetchReel);

/**
 * GET /api/reel/test
 * Test endpoint to verify route is working
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'Reel API route is working',
    endpoints: {
      POST: '/api/reel - Fetch reel data'
    }
  });
});

module.exports = router;
