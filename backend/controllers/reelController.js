const { scrapeInstagramReel } = require('../services/instagramScraper');
const { scrapeInstagramReelAlternative } = require('../services/instagramEmbedScraper');

/**
 * Middleware: Validate Instagram Reel URL
 */
const validateReelUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      error: 'URL is required',
      message: 'Please provide an Instagram Reel URL'
    });
  }

  // Validate Instagram Reel URL format
  const reelRegex = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/([a-zA-Z0-9_-]+)\/?/;

  if (!reelRegex.test(url)) {
    return res.status(400).json({
      error: 'Invalid URL format',
      message: 'Please provide a valid Instagram Reel URL',
      example: 'https://www.instagram.com/reel/ABC123XYZ/'
    });
  }

  next();
};

/**
 * Controller: Fetch Instagram Reel
 */
const fetchReel = async (req, res) => {
  const { url } = req.body;

  try {
    console.log(`Fetching reel: ${url}`);

    // Try alternative method first (more reliable)
    let reelData = null;
    try {
      reelData = await scrapeInstagramReelAlternative(url);
    } catch (altError) {
      console.log('Alternative method failed, trying original scraper...');
      // Fallback to original scraper
      reelData = await scrapeInstagramReel(url);
    }

    if (!reelData) {
      return res.status(404).json({
        error: 'Reel not found',
        message: 'Unable to fetch reel data. The reel may be private or unavailable.',
        educationalNote: 'Instagram frequently blocks scraping attempts. This is expected behavior.'
      });
    }

    res.status(200).json({
      success: true,
      data: reelData,
      disclaimer: 'This data is fetched for educational purposes only'
    });

  } catch (error) {
    console.error('Error fetching reel:', error.message);

    // Handle specific error types
    if (error.response) {
      // Instagram responded with error status
      const status = error.response.status;

      if (status === 404) {
        return res.status(404).json({
          error: 'Reel not found',
          message: 'The reel does not exist or is no longer available'
        });
      }

      if (status === 403 || status === 429) {
        return res.status(status).json({
          error: 'Access denied',
          message: 'Instagram has blocked this request. This is expected behavior.',
          educationalNote: 'Instagram actively prevents scraping to protect user privacy and platform integrity',
          status: status
        });
      }
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to fetch reel',
      message: error.message,
      educationalNote: 'Scraping Instagram is unreliable and may fail at any time'
    });
  }
};

module.exports = {
  validateReelUrl,
  fetchReel
};
