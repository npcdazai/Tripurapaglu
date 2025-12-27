import axios from 'axios';

/**
 * Extract shortcode from Instagram URL
 */
export const extractShortcode = (url) => {
  const match = url.match(/\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[2] : null;
};

/**
 * Try Instagram oEmbed API (more reliable than scraping)
 * This is a public API that Instagram provides for embedding
 */
const fetchViaOEmbed = async (url) => {
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;

    const response = await axios.get(oembedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data) {
      return {
        type: 'embed',
        thumbnail: response.data.thumbnail_url,
        title: response.data.title,
        author: response.data.author_name,
        authorUrl: response.data.author_url,
        embedHtml: response.data.html,
        width: response.data.thumbnail_width,
        height: response.data.thumbnail_height,
        providerName: response.data.provider_name
      };
    }

    return null;
  } catch (error) {
    console.error('OEmbed fetch failed:', error.message);
    return null;
  }
};

/**
 * Try to fetch via Instagram's public JSON endpoint
 * Format: https://www.instagram.com/p/{shortcode}/?__a=1&__d=dis
 */
const fetchViaJsonEndpoint = async (shortcode) => {
  try {
    // Instagram's JSON endpoint (may or may not work depending on their current setup)
    const jsonUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;

    const response = await axios.get(jsonUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (response.data && response.data.items && response.data.items[0]) {
      const item = response.data.items[0];
      const isVideo = item.media_type === 2 || item.product_type === 'clips';

      return {
        type: isVideo ? 'video' : 'image',
        videoUrl: isVideo ? item.video_versions?.[0]?.url : null,
        imageUrl: item.image_versions2?.candidates?.[0]?.url,
        thumbnail: item.image_versions2?.candidates?.[0]?.url,
        caption: item.caption?.text || '',
        likes: item.like_count || 0,
        comments: item.comment_count || 0,
        views: item.play_count || item.view_count || 0,
        owner: {
          username: item.user?.username,
          profilePic: item.user?.profile_pic_url
        }
      };
    }

    return null;
  } catch (error) {
    console.error('JSON endpoint fetch failed:', error.message);
    return null;
  }
};

/**
 * Main function - tries multiple methods
 */
export const scrapeInstagramReel = async (url) => {
  const shortcode = extractShortcode(url);

  if (!shortcode) {
    throw new Error('Invalid Instagram URL: Could not extract shortcode');
  }

  console.log(`Attempting to fetch reel: ${shortcode}`);
  console.log(`Trying multiple methods...`);

  // Method 1: Try oEmbed API (most reliable for basic info)
  console.log('Method 1: Trying oEmbed API...');
  const oembedData = await fetchViaOEmbed(url);
  if (oembedData) {
    console.log('✅ Success via oEmbed API');
    return {
      ...oembedData,
      shortcode,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      method: 'oembed',
      warning: 'Limited data available. Video playback may not work directly.'
    };
  }

  // Method 2: Try JSON endpoint
  console.log('Method 2: Trying JSON endpoint...');
  const jsonData = await fetchViaJsonEndpoint(shortcode);
  if (jsonData) {
    console.log('✅ Success via JSON endpoint');
    return {
      ...jsonData,
      shortcode,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      method: 'json',
      warning: 'This data may expire quickly. Media URLs are temporary.'
    };
  }

  // All methods failed
  console.log('❌ All methods failed');
  throw new Error('Unable to fetch reel data. Instagram may require login or the reel is private.');
};
