import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Import models and scraper
import SharedReel from '../lib/models/SharedReel.js';
import { scrapeInstagramReel } from '../lib/services/instagramScraper.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tripura_mandavkar:tripuraholic@cluster0.1u52nd6.mongodb.net/instagram-reel-viewer?retryWrites=true&w=majority';

async function rescrapeReels() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all reels (both pending and success) to re-scrape
    console.log('📥 Fetching all reels...');
    const reels = await SharedReel.find({}).sort({ createdAt: -1 });
    console.log(`Found ${reels.length} total reels\n`);

    if (reels.length === 0) {
      console.log('No reels to scrape!');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i];
      console.log(`\n[${i + 1}/${reels.length}] Processing: ${reel.url}`);
      console.log(`Current status: ${reel.status}, Method: ${reel.reelData?.method || 'unknown'}`);

      try {
        // Re-scrape the reel
        const reelData = await scrapeInstagramReel(reel.url);

        // Update the reel
        reel.reelData = reelData;
        reel.status = 'success';
        await reel.save();

        console.log(`✅ Success! Method: ${reelData.method}, Has video URL: ${!!reelData.videoUrl}`);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        reel.status = 'failed';
        reel.error = error.message;
        await reel.save();
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`Total processed: ${reels.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

rescrapeReels();
