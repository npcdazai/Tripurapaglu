const axios = require('axios');
const cheerio = require('cheerio');

/**
 * User-Agent strings to emulate a real browser
 * Instagram blocks requests without proper headers
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

/**
 * Get a random user agent
 */
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Extract Instagram shortcode from URL
 * @param {string} url - Instagram Reel URL
 * @returns {string} - Shortcode
 */
const extractShortcode = (url) => {
  const match = url.match(/\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[2] : null;
};

/**
 * Parse embedded JSON data from Instagram HTML
 * @param {string} html - HTML content from Instagram
 * @returns {object|null} - Parsed JSON data
 */
const parseEmbeddedData = (html) => {
  try {
    const $ = cheerio.load(html);

    // Method 1: Find script tag containing window._sharedData
    const sharedDataScript = $('script').filter((i, el) => {
      const content = $(el).html();
      return content && content.includes('window._sharedData');
    }).html();

    if (sharedDataScript) {
      const match = sharedDataScript.match(/window\._sharedData\s*=\s*({.+?});/);
      if (match) {
        return JSON.parse(match[1]);
      }
    }

    // Method 2: Find script tag with type="application/ld+json"
    const ldJsonScript = $('script[type="application/ld+json"]').html();
    if (ldJsonScript) {
      return JSON.parse(ldJsonScript);
    }

    // Method 3: Find script tag containing additionalDataLoaded
    const additionalDataScript = $('script').filter((i, el) => {
      const content = $(el).html();
      return content && content.includes('additionalDataLoaded');
    }).html();

    if (additionalDataScript) {
      const match = additionalDataScript.match(/additionalDataLoaded\('.*?',\s*({.+?})\)/);
      if (match) {
        return JSON.parse(match[1]);
      }
    }

    // Method 4: Meta tags fallback
    const metaData = {
      videoUrl: $('meta[property="og:video"]').attr('content'),
      imageUrl: $('meta[property="og:image"]').attr('content'),
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content')
    };

    if (metaData.videoUrl || metaData.imageUrl) {
      return metaData;
    }

    return null;
  } catch (error) {
    console.error('Error parsing embedded data:', error);
    return null;
  }
};

/**
 * Extract video/media URL from parsed data
 * @param {object} data - Parsed Instagram data
 * @returns {object|null} - Extracted media information
 */
const extractMediaUrl = (data) => {
  try {
    // Check if data is from meta tags
    if (data.videoUrl) {
      return {
        type: 'video',
        videoUrl: data.videoUrl,
        thumbnail: data.imageUrl,
        title: data.title,
        description: data.description
      };
    }

    // Navigate through _sharedData structure
    if (data.entry_data && data.entry_data.PostPage) {
      const media = data.entry_data.PostPage[0]?.graphql?.shortcode_media;

      if (media) {
        const isVideo = media.is_video || media.__typename === 'GraphVideo';

        return {
          type: isVideo ? 'video' : 'image',
          videoUrl: isVideo ? media.video_url : null,
          imageUrl: media.display_url,
          thumbnail: media.thumbnail_src || media.display_url,
          caption: media.edge_media_to_caption?.edges[0]?.node?.text || '',
          likes: media.edge_media_preview_like?.count || 0,
          comments: media.edge_media_to_comment?.count || 0,
          views: media.video_view_count || 0,
          owner: {
            username: media.owner?.username,
            profilePic: media.owner?.profile_pic_url
          },
          dimensions: {
            width: media.dimensions?.width,
            height: media.dimensions?.height
          }
        };
      }
    }

    // Check for items array structure
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
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
    console.error('Error extracting media URL:', error);
    return null;
  }
};

/**
 * Scrape Instagram Reel
 * @param {string} url - Instagram Reel URL
 * @returns {Promise<object|null>} - Reel data
 */
const scrapeInstagramReel = async (url) => {
  const shortcode = extractShortcode(url);

  if (!shortcode) {
    throw new Error('Invalid Instagram URL: Could not extract shortcode');
  }

  try {
    console.log(`Scraping Instagram reel: ${shortcode}`);

    // Prepare request with browser-like headers
    const headers = {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    // Make request to Instagram
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5
    });

    if (response.status !== 200) {
      throw new Error(`Instagram returned status ${response.status}`);
    }

    // Parse the HTML
    console.log(`Response status: ${response.status}, Content length: ${response.data.length}`);

    const embeddedData = parseEmbeddedData(response.data);

    if (!embeddedData) {
      console.warn('Could not parse embedded data from Instagram');
      console.warn('Response preview:', response.data.substring(0, 500));
      return null;
    }

    console.log('Successfully parsed embedded data');

    // Extract media URL
    const mediaData = extractMediaUrl(embeddedData);

    if (!mediaData) {
      console.warn('Could not extract media URL from parsed data');
      console.warn('Embedded data structure:', JSON.stringify(embeddedData).substring(0, 500));
      return null;
    }

    console.log(`Successfully extracted ${mediaData.type} data for shortcode: ${shortcode}`);

    return {
      ...mediaData,
      shortcode,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      warning: 'This data may expire quickly. Media URLs are temporary and may require authentication.'
    };

  } catch (error) {
    if (error.response) {
      console.error(`Instagram responded with status ${error.response.status}`);

      if (error.response.status === 404) {
        throw new Error('Reel not found or is private');
      }

      if (error.response.status === 429) {
        throw new Error('Rate limited by Instagram. Too many requests.');
      }

      if (error.response.status === 403) {
        throw new Error('Access forbidden. Instagram may have blocked this IP or requires login.');
      }
    }

    throw error;
  }
};

/**
 * EDUCATIONAL NOTE:
 *
 * This scraper demonstrates why web scraping is unreliable:
 *
 * 1. Instagram changes HTML structure frequently
 * 2. Video URLs expire quickly (often within minutes)
 * 3. Many reels require authentication to view
 * 4. Instagram actively blocks scraping with:
 *    - IP bans
 *    - Rate limiting
 *    - CAPTCHA challenges
 *    - JavaScript challenges
 * 5. This violates Instagram's Terms of Service
 *
 * For production applications:
 * - Use official Instagram Graph API (requires app approval)
 * - Build your own content platform
 * - Host videos on your own CDN
 * - Use legally licensed content
 */

module.exports = {
  scrapeInstagramReel,
  extractShortcode
};
