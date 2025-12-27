const SharedReel = require('../models/SharedReel');
const { scrapeInstagramReel, extractShortcode } = require('../services/instagramScraper');
const { scrapeInstagramReelAlternative } = require('../services/instagramEmbedScraper');

/**
 * Share a new reel (Sender only)
 */
const shareReel = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user._id;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Reel URL is required'
      });
    }

    const reelRegex = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/;
    if (!reelRegex.test(url)) {
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide a valid Instagram Reel URL'
      });
    }

    // Extract shortcode
    const shortcode = extractShortcode(url);
    if (!shortcode) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Could not extract reel shortcode from URL'
      });
    }

    // Check if reel already shared by this user
    const existingReel = await SharedReel.findOne({ shortcode, sharedBy: userId });
    if (existingReel) {
      return res.status(400).json({
        error: 'Already shared',
        message: 'You have already shared this reel',
        reel: existingReel
      });
    }

    // Create pending shared reel
    const sharedReel = await SharedReel.create({
      url,
      shortcode,
      sharedBy: userId,
      status: 'pending'
    });

    // Try to scrape reel data in background
    // First try alternative method, then fallback to original
    const scrapeReel = async () => {
      try {
        return await scrapeInstagramReelAlternative(url);
      } catch (altError) {
        console.log(`Alternative method failed for ${shortcode}, trying original...`);
        return await scrapeInstagramReel(url);
      }
    };

    scrapeReel()
      .then(async (reelData) => {
        sharedReel.reelData = reelData;
        sharedReel.status = 'success';
        await sharedReel.save();
        console.log(`✅ Reel scraped successfully: ${shortcode} (method: ${reelData.method || 'html'})`);
      })
      .catch(async (error) => {
        sharedReel.status = 'failed';
        sharedReel.error = {
          message: error.message,
          type: 'scraping_error'
        };
        await sharedReel.save();
        console.error(`❌ Failed to scrape reel ${shortcode}:`, error.message);
      });

    res.status(201).json({
      success: true,
      message: 'Reel shared successfully. Fetching data in background...',
      reel: sharedReel
    });
  } catch (error) {
    console.error('Share reel error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to share reel'
    });
  }
};

/**
 * Get all shared reels (Viewer only)
 */
const getAllSharedReels = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = {};
    if (status && ['pending', 'success', 'failed'].includes(status)) {
      query.status = status;
    }

    // Fetch reels
    const reels = await SharedReel.find(query)
      .populate('sharedBy', 'username role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SharedReel.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reels.length,
      total,
      reels
    });
  } catch (error) {
    console.error('Get shared reels error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch shared reels'
    });
  }
};

/**
 * Get sender's shared reels (Sender only)
 */
const getMySharedReels = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = { sharedBy: userId };
    if (status && ['pending', 'success', 'failed'].includes(status)) {
      query.status = status;
    }

    // Fetch reels
    const reels = await SharedReel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SharedReel.countDocuments(query);

    // Count by status
    const stats = {
      total: await SharedReel.countDocuments({ sharedBy: userId }),
      success: await SharedReel.countDocuments({ sharedBy: userId, status: 'success' }),
      pending: await SharedReel.countDocuments({ sharedBy: userId, status: 'pending' }),
      failed: await SharedReel.countDocuments({ sharedBy: userId, status: 'failed' })
    };

    res.status(200).json({
      success: true,
      count: reels.length,
      total,
      stats,
      reels
    });
  } catch (error) {
    console.error('Get my shared reels error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch your shared reels'
    });
  }
};

/**
 * Get single shared reel by ID
 */
const getSharedReelById = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await SharedReel.findById(id).populate('sharedBy', 'username role');

    if (!reel) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shared reel not found'
      });
    }

    // Increment view count for viewers
    if (req.user.role === 'viewer') {
      reel.viewCount += 1;
      await reel.save();
    }

    res.status(200).json({
      success: true,
      reel
    });
  } catch (error) {
    console.error('Get shared reel error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch shared reel'
    });
  }
};

/**
 * Delete shared reel (Sender only - own reels)
 */
const deleteSharedReel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reel = await SharedReel.findOne({ _id: id, sharedBy: userId });

    if (!reel) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shared reel not found or you do not have permission to delete it'
      });
    }

    await reel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Shared reel deleted successfully'
    });
  } catch (error) {
    console.error('Delete shared reel error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete shared reel'
    });
  }
};

/**
 * Get statistics (for both sender and viewer)
 */
const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'sender') {
      // Sender statistics
      stats = {
        totalShared: await SharedReel.countDocuments({ sharedBy: userId }),
        successfulShares: await SharedReel.countDocuments({ sharedBy: userId, status: 'success' }),
        pendingShares: await SharedReel.countDocuments({ sharedBy: userId, status: 'pending' }),
        failedShares: await SharedReel.countDocuments({ sharedBy: userId, status: 'failed' }),
        totalViews: await SharedReel.aggregate([
          { $match: { sharedBy: userId } },
          { $group: { _id: null, total: { $sum: '$viewCount' } } }
        ]).then(result => result[0]?.total || 0)
      };
    } else {
      // Viewer statistics
      stats = {
        totalReelsAvailable: await SharedReel.countDocuments({ status: 'success' }),
        totalSenders: await SharedReel.distinct('sharedBy').then(arr => arr.length),
        recentReels: await SharedReel.countDocuments({
          status: 'success',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      };
    }

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch statistics'
    });
  }
};

module.exports = {
  shareReel,
  getAllSharedReels,
  getMySharedReels,
  getSharedReelById,
  deleteSharedReel,
  getStatistics
};
