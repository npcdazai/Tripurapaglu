const express = require('express');
const router = express.Router();
const {
  shareReel,
  getAllSharedReels,
  getMySharedReels,
  getSharedReelById,
  deleteSharedReel,
  getStatistics
} = require('../controllers/sharedReelController');
const { authenticate, authorizeRole } = require('../middleware/auth');

/**
 * POST /api/shared-reels
 * Share a new reel (Sender only)
 */
router.post('/', authenticate, authorizeRole('sender'), shareReel);

/**
 * GET /api/shared-reels
 * Get all shared reels (Viewer only)
 */
router.get('/', authenticate, authorizeRole('viewer'), getAllSharedReels);

/**
 * GET /api/shared-reels/my
 * Get sender's own shared reels (Sender only)
 */
router.get('/my', authenticate, authorizeRole('sender'), getMySharedReels);

/**
 * GET /api/shared-reels/stats
 * Get statistics
 */
router.get('/stats', authenticate, getStatistics);

/**
 * GET /api/shared-reels/:id
 * Get single shared reel by ID
 */
router.get('/:id', authenticate, getSharedReelById);

/**
 * DELETE /api/shared-reels/:id
 * Delete shared reel (Sender only - own reels)
 */
router.delete('/:id', authenticate, authorizeRole('sender'), deleteSharedReel);

module.exports = router;
