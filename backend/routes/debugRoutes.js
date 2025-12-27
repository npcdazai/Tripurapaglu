const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/debug/instagram-test
 * Test what Instagram returns
 */
router.get('/instagram-test', async (req, res) => {
  const testUrl = req.query.url || 'https://www.instagram.com/reel/DO7c3eAj6Zw/';

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    };

    const response = await axios.get(testUrl, { headers, timeout: 10000 });

    const htmlPreview = response.data.substring(0, 1000);
    const hasSharedData = response.data.includes('window._sharedData');
    const hasJsonLd = response.data.includes('application/ld+json');
    const hasOgVideo = response.data.includes('og:video');

    res.json({
      success: true,
      url: testUrl,
      status: response.status,
      contentLength: response.data.length,
      htmlPreview,
      indicators: {
        hasSharedData,
        hasJsonLd,
        hasOgVideo
      },
      message: 'Check if Instagram is returning proper data'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: error.response?.status,
      message: 'Instagram likely blocked the request'
    });
  }
});

module.exports = router;
