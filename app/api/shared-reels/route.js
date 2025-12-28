import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import SharedReel from '@/lib/models/SharedReel';
import { verifyToken } from '@/lib/middleware/auth';
import { scrapeInstagramReel, extractShortcode } from '@/lib/services/instagramScraper';

// GET - Fetch shared reels
export async function GET(request) {
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Fetch reels
    const reels = await SharedReel.find(query)
      .populate('sharedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      reels,
      count: reels.length
    });

  } catch (error) {
    console.error('Fetch reels error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}

// POST - Share a new reel
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

    // Check role
    if (decoded.role !== 'sender') {
      return NextResponse.json(
        { error: 'Only senders can share reels' },
        { status: 403 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Reel URL is required' },
        { status: 400 }
      );
    }

    // Extract shortcode
    const shortcode = extractShortcode(url);
    if (!shortcode) {
      return NextResponse.json(
        { error: 'Invalid Instagram URL' },
        { status: 400 }
      );
    }

    // Check if already shared
    const existing = await SharedReel.findOne({ shortcode });
    if (existing) {
      return NextResponse.json(
        { error: 'This reel has already been shared' },
        { status: 400 }
      );
    }

    // Create initial reel record
    const sharedReel = await SharedReel.create({
      url,
      shortcode,
      sharedBy: decoded.userId,
      status: 'pending'
    });

    // Scrape in background (don't await)
    scrapeInstagramReel(url)
      .then(async (reelData) => {
        sharedReel.reelData = reelData;
        sharedReel.status = 'success';
        await sharedReel.save();
        console.log(`✅ Successfully scraped reel: ${shortcode}`);

        // Send push notification to all viewers
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '🎬 New Reel Shared!',
              body: `Check out this new reel: ${reelData.title || shortcode}`,
              icon: '/tripura-profile.png',
              url: '/tripura_mandavkar'
            })
          });
          console.log('📱 Push notification sent');
        } catch (notifError) {
          console.error('Failed to send push notification:', notifError);
        }
      })
      .catch(async (error) => {
        console.error(`❌ Failed to scrape reel ${shortcode}:`, error.message);
        sharedReel.status = 'failed';
        sharedReel.error = {
          message: error.message,
          type: error.name
        };
        await sharedReel.save();
      });

    return NextResponse.json({
      message: 'Reel shared successfully. Fetching data in background...',
      reel: {
        id: sharedReel._id,
        shortcode: sharedReel.shortcode,
        status: sharedReel.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Share reel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share reel' },
      { status: 500 }
    );
  }
}
