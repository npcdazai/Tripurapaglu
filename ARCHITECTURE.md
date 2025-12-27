# 🏗️ Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (http://localhost:3000)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ (POST /api/reel)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components:                                          │  │
│  │  • ReelViewer    - Main component                    │  │
│  │  • VideoPlayer   - Media display                     │  │
│  │  • ErrorDisplay  - Error handling                    │  │
│  │  • Disclaimer    - Legal warnings                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ Axios POST
                             │ { url: "instagram.com/reel/..." }
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Express.js)                      │
│                   (http://localhost:5000)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes:                                              │  │
│  │  POST /api/reel    → reelController.fetchReel()      │  │
│  │  GET  /health      → Health check                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controller:                                          │  │
│  │  • validateReelUrl() - URL validation                │  │
│  │  • fetchReel()       - Request handler               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service:                                             │  │
│  │  • scrapeInstagramReel() - Core logic                │  │
│  │  • parseEmbeddedData()   - HTML parsing              │  │
│  │  • extractMediaUrl()     - Data extraction           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP GET with headers
                             │ User-Agent: Mozilla/5.0...
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Instagram Web Server                      │
│                  (instagram.com/reel/...)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Response:                                            │  │
│  │  • HTML with embedded JSON                           │  │
│  │  • window._sharedData = {...}                        │  │
│  │  • video_url, display_url, metadata                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Security Measures:                                   │  │
│  │  • Rate Limiting                                      │  │
│  │  • IP Blocking                                        │  │
│  │  • CAPTCHA Challenges                                │  │
│  │  • Authentication Requirements                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Request Flow

```
User Input (URL)
    ↓
Frontend Validation
    ↓
API Request to Backend
    ↓
Backend Validation
    ↓
Scraper Service
    ↓
Instagram Request
    ↓
HTML Response
    ↓
Parse & Extract
    ↓
Return to Frontend
    ↓
Display Video/Error
```

### 2. Detailed Request Lifecycle

#### Phase 1: Frontend (React/Next.js)

```javascript
// 1. User submits URL
handleSubmit(url) {
  // 2. Client-side validation
  validateUrl(url)

  // 3. Make API call
  axios.post('/api/reel', { url })
    .then(response => displayVideo(response.data))
    .catch(error => displayError(error))
}
```

#### Phase 2: Backend (Express.js)

```javascript
// 4. Receive request
POST /api/reel
  ↓
// 5. Middleware: Validate URL
validateReelUrl(req, res, next)
  ↓
// 6. Controller: Process request
fetchReel(req, res)
  ↓
// 7. Service: Scrape Instagram
scrapeInstagramReel(url)
```

#### Phase 3: Scraper Service

```javascript
// 8. Extract shortcode from URL
extractShortcode(url) → "ABC123XYZ"

// 9. Prepare HTTP request
headers = {
  'User-Agent': 'Mozilla/5.0...',
  'Accept': 'text/html...',
  // ... more headers
}

// 10. Send request to Instagram
axios.get(url, { headers })

// 11. Receive HTML response
<html>
  <script>
    window._sharedData = {
      "entry_data": {
        "PostPage": [{
          "graphql": {
            "shortcode_media": {
              "video_url": "https://...",
              "display_url": "https://...",
              // ... metadata
            }
          }
        }]
      }
    }
  </script>
</html>

// 12. Parse HTML
cheerio.load(html)

// 13. Extract embedded JSON
parseEmbeddedData(html)

// 14. Navigate JSON structure
extractMediaUrl(data)

// 15. Return video URL + metadata
return {
  type: 'video',
  videoUrl: 'https://...',
  thumbnail: 'https://...',
  caption: '...',
  likes: 12345,
  // ... more metadata
}
```

---

## Component Architecture

### Backend Components

#### 1. Server (server.js)
- Express app initialization
- Middleware setup (CORS, JSON parsing)
- Route mounting
- Error handling
- Server startup

#### 2. Routes (routes/reelRoutes.js)
- API endpoint definitions
- Route-level middleware
- Request routing to controllers

#### 3. Controllers (controllers/reelController.js)
- Request validation
- Business logic coordination
- Response formatting
- Error handling

#### 4. Services (services/instagramScraper.js)
- Core scraping logic
- HTTP requests
- HTML parsing
- Data extraction

### Frontend Components

#### 1. Layout (app/layout.js)
- Root HTML structure
- Global metadata
- CSS imports

#### 2. Page (app/page.js)
- Main page component
- Component composition
- Educational content

#### 3. ReelViewer (components/ReelViewer.js)
- User input handling
- API communication
- State management
- Conditional rendering

#### 4. VideoPlayer (components/VideoPlayer.js)
- Video element control
- Metadata display
- Playback management

#### 5. ErrorDisplay (components/ErrorDisplay.js)
- Error message formatting
- Solution suggestions
- Educational notes

---

## API Design

### Endpoint: POST /api/reel

#### Request

```json
{
  "url": "https://www.instagram.com/reel/ABC123XYZ/"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "type": "video",
    "videoUrl": "https://scontent.cdninstagram.com/v/...",
    "thumbnail": "https://scontent.cdninstagram.com/v/...",
    "imageUrl": "https://scontent.cdninstagram.com/v/...",
    "caption": "Check out this amazing reel!",
    "likes": 12345,
    "comments": 678,
    "views": 98765,
    "owner": {
      "username": "example_user",
      "profilePic": "https://..."
    },
    "dimensions": {
      "width": 1080,
      "height": 1920
    },
    "shortcode": "ABC123XYZ",
    "sourceUrl": "https://www.instagram.com/reel/ABC123XYZ/",
    "scrapedAt": "2024-01-15T10:30:00.000Z",
    "warning": "This data may expire quickly..."
  },
  "disclaimer": "This data is fetched for educational purposes only"
}
```

#### Error Response (4xx/5xx)

```json
{
  "error": "Reel not found",
  "message": "The reel does not exist or is no longer available",
  "educationalNote": "Instagram actively prevents scraping...",
  "status": 404
}
```

---

## Scraping Strategy

### 1. URL Formats Supported

```
✅ https://www.instagram.com/reel/ABC123XYZ/
✅ https://instagram.com/reel/ABC123XYZ/
✅ https://www.instagram.com/reels/ABC123XYZ/
✅ https://www.instagram.com/p/ABC123XYZ/
```

### 2. Browser Emulation

```javascript
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9...',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0'
};
```

### 3. Parsing Methods

The scraper tries multiple methods to extract data:

#### Method 1: window._sharedData
```javascript
const match = script.match(/window\._sharedData\s*=\s*({.+?});/);
const data = JSON.parse(match[1]);
```

#### Method 2: JSON-LD
```javascript
const ldJson = $('script[type="application/ld+json"]').html();
const data = JSON.parse(ldJson);
```

#### Method 3: additionalDataLoaded
```javascript
const match = script.match(/additionalDataLoaded\('.*?',\s*({.+?})\)/);
const data = JSON.parse(match[1]);
```

#### Method 4: Meta Tags Fallback
```javascript
const videoUrl = $('meta[property="og:video"]').attr('content');
const imageUrl = $('meta[property="og:image"]').attr('content');
```

### 4. Data Extraction Paths

```javascript
// Path 1: _sharedData structure
data.entry_data.PostPage[0].graphql.shortcode_media.video_url

// Path 2: Items array structure
data.items[0].video_versions[0].url

// Path 3: Meta tag fallback
meta[property="og:video"].content
```

---

## Security Considerations

### What Instagram Does to Block Scrapers

1. **Rate Limiting**
   - Limits requests per IP per timeframe
   - Returns 429 Too Many Requests

2. **IP Blocking**
   - Bans suspicious IP addresses
   - Returns 403 Forbidden

3. **User-Agent Validation**
   - Checks for valid browser signatures
   - Rejects server-like agents

4. **JavaScript Challenges**
   - Requires JS execution
   - Our scraper doesn't execute JS (limitation)

5. **Session Validation**
   - Checks for login cookies
   - Requires authentication for most content

6. **CAPTCHA**
   - Presents human verification challenges
   - Cannot be bypassed programmatically

### Why Our Scraper Fails (By Design)

- ❌ No JavaScript execution
- ❌ No cookie/session handling
- ❌ No CAPTCHA solving
- ❌ No login credentials
- ❌ Simple header emulation
- ❌ No proxy rotation
- ❌ No request throttling

**These limitations are intentional** to demonstrate why scraping is unreliable.

---

## Error Handling Strategy

### Error Types

1. **Validation Errors (400)**
   - Invalid URL format
   - Missing parameters

2. **Not Found (404)**
   - Reel doesn't exist
   - Private content

3. **Forbidden (403)**
   - IP blocked
   - Authentication required

4. **Rate Limited (429)**
   - Too many requests
   - Temporary ban

5. **Server Errors (500)**
   - Parsing failures
   - Unexpected errors

### Error Response Format

```javascript
{
  error: 'Error type',
  message: 'User-friendly message',
  educationalNote: 'Why this happened',
  status: 403,
  // Additional context
}
```

---

## Performance Considerations

### Backend
- Axios timeout: 15 seconds
- No caching (intentional - shows data staleness)
- No retry logic (intentional - shows unreliability)

### Frontend
- API timeout: 20 seconds
- No request debouncing (single submit)
- Real-time error display

### Why No Optimizations?

This is an **educational project** that intentionally:
- Shows failures in real-time
- Doesn't hide platform restrictions
- Demonstrates unreliability

---

## Limitations (Intentional)

1. **No Authentication**
   - Cannot access private content
   - Cannot view age-restricted reels

2. **No JavaScript Execution**
   - Cannot handle JS-rendered content
   - Cannot solve challenges

3. **No Proxy Support**
   - Single IP gets banned quickly
   - No rotation mechanism

4. **No Caching**
   - Every request hits Instagram
   - Shows rate limiting quickly

5. **No Retry Logic**
   - Fails immediately on error
   - Demonstrates unreliability

---

## Scalability Analysis

### Why This Doesn't Scale

1. **Instagram Blocks IPs**
   - Single server IP gets banned
   - Would need proxy rotation (expensive)

2. **Video URLs Expire**
   - Cannot cache long-term
   - Requires constant re-fetching

3. **HTML Structure Changes**
   - Parser breaks when Instagram updates
   - Requires constant maintenance

4. **Legal Issues**
   - Violates Terms of Service
   - Risk of lawsuits

### Proper Scalable Architecture

Instead, build your own platform:

```
User Upload → Processing → Storage → CDN → Users
              (FFmpeg)     (S3)      (CloudFront)
```

Benefits:
- ✅ Legal
- ✅ Reliable
- ✅ Scalable
- ✅ Monetizable

---

## Technology Choices Explained

### Why Next.js?
- Modern React framework
- Easy deployment
- Built-in routing
- Good developer experience

### Why Express?
- Simple and flexible
- Large ecosystem
- Easy to understand
- Perfect for educational purposes

### Why Cheerio?
- Fast HTML parsing
- jQuery-like syntax
- No browser overhead
- Perfect for server-side parsing

### Why Axios?
- Promise-based
- Browser and Node.js support
- Easy error handling
- Timeout support

### Why Tailwind?
- Rapid UI development
- Responsive design
- No CSS file management
- Modern styling approach

---

## Deployment Considerations

### ⚠️ DO NOT DEPLOY TO PRODUCTION

This project should **never** be deployed publicly because:

1. Violates Instagram ToS
2. Will get IP banned quickly
3. Legal liability
4. Unreliable service
5. Ethical concerns

### For Educational Testing Only

If testing on a VPS:
- Use only for learning
- Don't share publicly
- Expect to get banned
- Don't use personal accounts

---

## Future Learning Paths

After understanding this project, learn:

1. **Build Legal Alternatives**
   - Video hosting platforms
   - Content management systems
   - Social media aggregators (with official APIs)

2. **Study Official APIs**
   - Instagram Graph API
   - Facebook Graph API
   - Twitter API
   - TikTok API

3. **Video Platform Development**
   - FFmpeg video processing
   - CDN integration
   - Streaming protocols
   - Thumbnail generation

4. **Security & Ethics**
   - Web application security
   - Privacy protection
   - Ethical development practices
   - Legal compliance

---

## Conclusion

This architecture intentionally demonstrates:
- ✅ How web scraping works (technically)
- ✅ Why web scraping fails (practically)
- ✅ Why platforms block scrapers (security)
- ✅ Why legal alternatives exist (ethics)

**Key Takeaway**: Build your own platforms legally instead of scraping others.
