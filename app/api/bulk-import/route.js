import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import SharedReel from '@/lib/models/SharedReel';
import { verifyToken } from '@/lib/middleware/auth';
import { scrapeInstagramReel } from '@/lib/services/instagramScraper';

export async function POST(request) {
  try {
    await connectDB();

    // Verify auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check role - allow both sender and viewer for bulk import
    const { shortcodes } = await request.json();

    if (!shortcodes || !Array.isArray(shortcodes) || shortcodes.length === 0) {
      return NextResponse.json(
        { error: 'Shortcodes array is required' },
        { status: 400 }
      );
    }

    if (shortcodes.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 reels allowed at once' },
        { status: 400 }
      );
    }

    const results = {
      total: shortcodes.length,
      success: 0,
      failed: 0,
      errors: [],
      reels: []
    };

    // Process each shortcode
    for (const shortcode of shortcodes) {
      try {
        // Validate shortcode format
        if (!/^[a-zA-Z0-9_-]+$/.test(shortcode)) {
          results.failed++;
          results.errors.push(`Invalid shortcode format: ${shortcode}`);
          continue;
        }

        // Construct URL
        const url = `https://www.instagram.com/reel/${shortcode}/`;

        // Check if already exists
        const existing = await SharedReel.findOne({ shortcode });
        if (existing) {
          results.failed++;
          results.errors.push(`Already imported: ${shortcode}`);
          continue;
        }

        // Create pending reel
        const sharedReel = await SharedReel.create({
          url,
          shortcode,
          sharedBy: decoded.userId,
          status: 'pending'
        });

        results.success++;
        results.reels.push({
          id: sharedReel._id,
          shortcode,
          status: 'pending'
        });

        // Scrape in background (don't await)
        scrapeInstagramReel(url)
          .then(async (reelData) => {
            sharedReel.reelData = reelData;
            sharedReel.status = 'success';
            await sharedReel.save();
            console.log(`✅ Successfully scraped: ${shortcode}`);
          })
          .catch(async (error) => {
            console.error(`❌ Failed to scrape ${shortcode}:`, error.message);
            sharedReel.status = 'failed';
            sharedReel.error = {
              message: error.message,
              type: error.name
            };
            await sharedReel.save();
          });

      } catch (error) {
        console.error(`Error processing ${shortcode}:`, error);
        results.failed++;
        results.errors.push(`${shortcode}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: `Bulk import queued: ${results.success} reels`,
      ...results
    }, { status: 201 });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Bulk import failed' },
      { status: 500 }
    );
  }
}
