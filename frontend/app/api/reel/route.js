import { NextResponse } from 'next/server';
import { scrapeInstagramReel } from '@/lib/services/instagramScraper';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reel URL is required'
        },
        { status: 400 }
      );
    }

    // Scrape the reel
    const reelData = await scrapeInstagramReel(url);

    return NextResponse.json({
      success: true,
      data: reelData
    });

  } catch (error) {
    console.error('Scrape reel error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch reel'
      },
      { status: 500 }
    );
  }
}
