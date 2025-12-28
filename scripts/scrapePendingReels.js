// Script to scrape all pending reels
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const scrapeReel = async (url) => {
  const shortcode = url.match(/\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/)?.[2];
  const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(oembedUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    return {
      type: 'embed',
      thumbnail: response.data.thumbnail_url,
      title: response.data.title,
      author: response.data.author_name,
      embedHtml: response.data.html,
      sourceUrl: url,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to scrape: ' + error.message);
  }
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const SharedReel = require('../lib/models/SharedReel').default;

  const pendingReels = await SharedReel.find({ status: 'pending' });
  console.log('Found', pendingReels.length, 'pending reels\n');

  for (const reel of pendingReels) {
    console.log('Scraping:', reel.shortcode, '-', reel.url);
    try {
      const reelData = await scrapeReel(reel.url);
      reel.reelData = reelData;
      reel.status = 'success';
      await reel.save();
      console.log('✅ Success:', reel.shortcode);
    } catch (error) {
      console.error('❌ Failed:', reel.shortcode, '-', error.message);
      reel.status = 'failed';
      reel.error = { message: error.message };
      await reel.save();
    }
    console.log('');
  }

  const summary = await SharedReel.countDocuments({});
  const success = await SharedReel.countDocuments({ status: 'success' });
  const pending = await SharedReel.countDocuments({ status: 'pending' });
  const failed = await SharedReel.countDocuments({ status: 'failed' });

  console.log('Summary:');
  console.log('Total:', summary);
  console.log('Success:', success);
  console.log('Pending:', pending);
  console.log('Failed:', failed);

  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
