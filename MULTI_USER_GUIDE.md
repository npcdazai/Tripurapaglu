# 👥 Multi-User System Guide

## Overview

The Instagram Reel Viewer now supports a **multi-user system** with two distinct roles:

1. **📤 Sender** - Can share Instagram Reels via links
2. **👀 Viewer** - Can view all shared reels from all senders

This system uses MongoDB for data persistence, JWT for authentication, and implements role-based access control.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Registration                        │
│                  (Choose: Sender or Viewer)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼────────┐
        │  SENDER Role   │      │  VIEWER Role  │
        └───────┬────────┘      └──────┬────────┘
                │                       │
        ┌───────▼────────┐      ┌──────▼────────┐
        │ Share Reels    │      │ View All      │
        │ via URL        │      │ Shared Reels  │
        └───────┬────────┘      └──────┬────────┘
                │                       │
                │   ┌───────────────┐   │
                └──►│   MongoDB     │◄──┘
                    │  SharedReels  │
                    └───────────────┘
```

---

## 🚀 Setup Instructions

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and run MongoDB service
- Default port: 27017

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

New dependencies added:
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `express-validator` - Input validation

### 3. Configure Environment

Ensure `backend/.env` has:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/instagram-reel-viewer
JWT_SECRET=dev-secret-key-12345-change-in-production
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📁 Database: instagram-reel-viewer
╔════════════════════════════════════════════════╗
║  Instagram Reel Viewer API (Educational)      ║
║  Server running on port 5000                  ║
╚════════════════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📱 User Guide

### Registration & Login

1. Go to http://localhost:3000
2. Click "Switch to Multi-User Mode"
3. Choose "Register" tab
4. Enter username and password
5. Select role:
   - **📤 Sender** - To share reels
   - **👀 Viewer** - To view shared reels
6. Click "Register"

### Sender Workflow

After logging in as a Sender, you'll see the Sender Dashboard:

#### Features:
- **📊 Statistics**
  - Total Shared reels
  - Successful shares
  - Pending shares
  - Total views from viewers

- **📎 Share New Reel**
  - Paste Instagram Reel URL
  - Click "Share Reel"
  - System scrapes data in background
  - Status updates automatically

- **📋 My Shared Reels**
  - View all your shared reels
  - See status (pending, success, failed)
  - View count per reel
  - Delete reels

#### Example:
```
1. Find a public Instagram Reel
2. Copy URL: https://www.instagram.com/reel/ABC123/
3. Paste in "Share New Reel" section
4. Click "Share Reel"
5. Wait for scraping to complete
6. Reel is now visible to all viewers
```

### Viewer Workflow

After logging in as a Viewer, you'll see the Viewer Dashboard:

#### Features:
- **📊 Statistics**
  - Total available reels
  - Number of senders
  - Recent reels (last 24 hours)

- **🔄 Auto-Refresh**
  - Automatically fetches new reels every 10 seconds
  - Toggle on/off

- **🎯 Filters**
  - All reels
  - Success only
  - Pending only
  - Failed only

- **🎬 Reel Grid**
  - Thumbnail previews
  - Click to view full reel
  - Video playback
  - Metadata display

#### Example:
```
1. Login as Viewer
2. See all shared reels in grid
3. Click on a reel to view
4. Watch video (if available)
5. See caption, likes, views
6. Auto-refresh brings new reels
```

---

## 🔐 Authentication System

### JWT Token Flow

1. **Registration/Login**
   ```
   User → POST /api/auth/register or /login
   Server → Returns JWT token + user data
   Frontend → Stores token in localStorage
   ```

2. **Authenticated Requests**
   ```
   Frontend → Sends: Authorization: Bearer <token>
   Backend → Verifies token
   Backend → Attaches user to request
   ```

3. **Role-Based Access**
   ```
   Sender → Can access /api/shared-reels (POST, DELETE)
   Viewer → Can access /api/shared-reels (GET)
   ```

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Expiration**: 7 days
- **Role Validation**: Middleware checks user role
- **Token Verification**: On every protected route

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Auth | Get current user |

### Shared Reels

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/shared-reels` | Sender | Share new reel |
| GET | `/api/shared-reels` | Viewer | Get all shared reels |
| GET | `/api/shared-reels/my` | Sender | Get sender's reels |
| GET | `/api/shared-reels/stats` | Both | Get statistics |
| GET | `/api/shared-reels/:id` | Both | Get single reel |
| DELETE | `/api/shared-reels/:id` | Sender | Delete own reel |

---

## 💾 Database Schema

### User Model

```javascript
{
  username: String,       // Unique, 3-20 chars
  password: String,       // Hashed with bcrypt
  role: String,          // 'sender' or 'viewer'
  createdAt: Date,
  updatedAt: Date
}
```

### SharedReel Model

```javascript
{
  url: String,           // Instagram URL
  shortcode: String,     // Reel identifier
  sharedBy: ObjectId,    // Reference to User
  reelData: {
    type: String,        // 'video' or 'image'
    videoUrl: String,
    thumbnail: String,
    caption: String,
    likes: Number,
    comments: Number,
    views: Number,
    owner: {
      username: String,
      profilePic: String
    }
  },
  status: String,        // 'pending', 'success', 'failed'
  error: {
    message: String,
    type: String
  },
  viewCount: Number,     // Incremented by viewers
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Real-Time Updates

### Viewer Auto-Refresh

The Viewer dashboard implements **automatic polling**:

```javascript
// Updates every 10 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchReels(token, true); // Silent refresh
  }, 10000);

  return () => clearInterval(interval);
}, [autoRefresh]);
```

**Why polling instead of WebSocket?**
- Simpler implementation
- No additional server infrastructure
- Sufficient for this educational project
- Easy to understand and maintain

### Alternative: WebSocket Implementation

For production, consider using WebSocket for real-time updates:

```bash
npm install socket.io socket.io-client
```

**Benefits:**
- Instant updates
- Lower server load
- Better user experience

---

## 📊 Example Usage Scenarios

### Scenario 1: Team Content Sharing

**Setup:**
- 1 Content Manager (Sender)
- 5 Team Members (Viewers)

**Workflow:**
```
1. Manager finds interesting reels
2. Manager shares URLs via dashboard
3. Team members see reels automatically
4. Team can discuss without leaving platform
```

### Scenario 2: Educational Collection

**Setup:**
- Multiple Teachers (Senders)
- Students (Viewers)

**Workflow:**
```
1. Teachers share educational reels
2. Students view curated collection
3. No Instagram account needed
4. Controlled content environment
```

---

## ⚠️ Known Limitations

### 1. Instagram Scraping Reliability

- Most scraping attempts will fail
- Video URLs expire quickly
- Private reels cannot be accessed
- Instagram actively blocks scrapers

**This is intentional** - the project demonstrates why scraping is unreliable.

### 2. Storage Considerations

- Database stores reel metadata
- Video URLs are temporary
- Need to re-scrape periodically
- Consider cleanup jobs for old data

### 3. Scalability

- Not designed for production
- No caching layer
- No queue system for scraping
- Single MongoDB instance

---

## 🛠️ Development Tips

### Testing with Multiple Users

**Option 1: Multiple Browsers**
- Chrome: Sender account
- Firefox: Viewer account
- Edge: Another viewer

**Option 2: Incognito Windows**
- Regular window: Sender
- Incognito 1: Viewer 1
- Incognito 2: Viewer 2

### Debugging

**Check MongoDB data:**
```bash
mongosh
use instagram-reel-viewer
db.users.find().pretty()
db.sharedreels.find().pretty()
```

**Check JWT token:**
```javascript
// In browser console
localStorage.getItem('token')
localStorage.getItem('user')
```

**Test API endpoints:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"sender1","password":"123456","role":"sender"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sender1","password":"123456"}'

# Get shared reels (replace TOKEN)
curl http://localhost:5000/api/shared-reels \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚀 Future Enhancements

### Suggested Features:

1. **User Profiles**
   - Avatar upload
   - Bio/description
   - Follow system

2. **Collections**
   - Group reels by category
   - Create playlists
   - Tag system

3. **Comments**
   - Viewers can comment on reels
   - Reply system
   - Moderation

4. **Notifications**
   - Email alerts for new reels
   - In-app notifications
   - Browser push notifications

5. **Analytics**
   - View history
   - Popular reels
   - Sender leaderboard

6. **Export**
   - Download reel list
   - Generate reports
   - Share collections

---

## 🔒 Security Best Practices

### For Production:

1. **Environment Variables**
   ```env
   JWT_SECRET=use-strong-random-string-here
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   ```

2. **Password Policy**
   - Minimum 8 characters
   - Require uppercase, lowercase, number
   - Prevent common passwords

3. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use('/api/auth', rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5
   }));
   ```

4. **Input Sanitization**
   - Validate all user inputs
   - Prevent XSS attacks
   - SQL/NoSQL injection prevention

5. **HTTPS**
   - Use SSL certificates
   - Force HTTPS redirect
   - Secure cookies

---

## 📚 Educational Value

### What You Learn:

1. **Full-Stack Development**
   - MongoDB + Express + React + Node.js
   - Complete CRUD operations
   - RESTful API design

2. **Authentication & Authorization**
   - JWT implementation
   - Role-based access control
   - Password security

3. **Database Design**
   - Schema modeling
   - Relationships
   - Indexing

4. **Real-Time Features**
   - Polling vs WebSocket
   - State management
   - Data synchronization

5. **Error Handling**
   - Validation errors
   - Network errors
   - Authentication errors

---

## ⚖️ Legal Reminder

**This multi-user system still violates Instagram's Terms of Service.**

For legal alternatives:
- Use Instagram's official Graph API
- Build your own video platform
- Host user-uploaded content
- License content properly

---

## 🆘 Troubleshooting

### MongoDB Connection Failed

```
Error: MongoDB Connection Error
```

**Solutions:**
- Ensure MongoDB is running: `brew services list` or `mongod --version`
- Check connection string in `.env`
- Verify port 27017 is not blocked

### JWT Token Invalid

```
Error: Unauthorized - Invalid token
```

**Solutions:**
- Check JWT_SECRET matches between requests
- Token may have expired (7 days)
- Clear localStorage and login again

### Reels Not Showing for Viewer

**Checklist:**
- Sender has shared reels successfully
- Reels have status "success"
- Viewer is logged in correctly
- Auto-refresh is enabled
- Check browser console for errors

### Scraping Always Fails

**This is expected!**
- Instagram blocks most scraping attempts
- Use for demonstration only
- Understand why it fails (that's the lesson)

---

## ✅ Quick Start Checklist

- [ ] MongoDB installed and running
- [ ] Backend dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Backend server started (port 5000)
- [ ] Frontend server started (port 3000)
- [ ] Navigate to http://localhost:3000
- [ ] Register sender account
- [ ] Register viewer account
- [ ] Test sharing reel as sender
- [ ] View reel as viewer

---

## 📖 Related Documentation

- [README.md](README.md) - Main project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Installation guide

---

**Happy Learning! 🎓**

Remember: This project is for educational purposes to demonstrate why web scraping is problematic and how to build user systems properly.
