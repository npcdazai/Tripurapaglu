# 🚀 Complete Setup Guide

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** version 18 or higher installed
- [ ] **npm** or **yarn** package manager
- [ ] **Git** (optional, for version control)
- [ ] A code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access
- [ ] Basic understanding of JavaScript

---

## 📋 Step-by-Step Installation

### Step 1: Verify Node.js Installation

```bash
# Check Node.js version
node --version
# Should show v18.x.x or higher

# Check npm version
npm --version
# Should show 9.x.x or higher
```

If not installed, download from: https://nodejs.org/

---

### Step 2: Navigate to Project Directory

```bash
cd d:\Tripura\insta-viewer
```

---

### Step 3: Backend Setup

#### 3.1 Navigate to Backend Folder

```bash
cd backend
```

#### 3.2 Install Dependencies

```bash
npm install
```

This will install:
- express (v4.18.2)
- cors (v2.8.5)
- axios (v1.6.2)
- cheerio (v1.0.0-rc.12)
- dotenv (v16.3.1)
- nodemon (v3.0.2) - dev dependency

#### 3.3 Verify Installation

```bash
# Check if node_modules folder was created
dir node_modules    # Windows
ls node_modules     # Mac/Linux
```

#### 3.4 Environment Configuration

The `.env` file should already exist with:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

If not, create it from the example:

```bash
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

#### 3.5 Test Backend Server

```bash
# Start the server
npm run dev

# You should see:
# ╔════════════════════════════════════════════════╗
# ║  Instagram Reel Viewer API (Educational)      ║
# ║  Server running on port 5000                  ║
# ║  Environment: development                      ║
# ╚════════════════════════════════════════════════╝
```

#### 3.6 Test Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Instagram Reel Viewer API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Or open in browser: http://localhost:5000/health

#### 3.7 Stop the Server

Press `Ctrl + C` in the terminal

---

### Step 4: Frontend Setup

#### 4.1 Navigate to Frontend Folder

```bash
# From project root
cd ../frontend

# Or from backend folder
cd ../frontend
```

#### 4.2 Install Dependencies

```bash
npm install
```

This will install:
- next (v14.0.4)
- react (v18.2.0)
- react-dom (v18.2.0)
- axios (v1.6.2)
- tailwindcss (v3.3.6)
- autoprefixer (v10.4.16)
- postcss (v8.4.32)
- eslint (v8.56.0)
- eslint-config-next (v14.0.4)

#### 4.3 Environment Configuration

The `.env.local` file should already exist with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

If not, create it:

```bash
copy .env.local.example .env.local    # Windows
cp .env.local.example .env.local      # Mac/Linux
```

#### 4.4 Test Frontend Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

#### 4.5 Open in Browser

Navigate to: http://localhost:3000

You should see the Instagram Reel Viewer interface with:
- Header with "Instagram Reel Viewer"
- Educational disclaimer (collapsible)
- URL input field
- "Fetch Reel" button
- Educational information sections
- Footer

---

### Step 5: Running Both Servers

You need **two terminal windows**:

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Keep this running.

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Keep this running.

---

## ✅ Verification Tests

### Test 1: Backend Health Check

**Terminal:**
```bash
curl http://localhost:5000/health
```

**Browser:**
```
http://localhost:5000/health
```

**Expected:** JSON response with status "OK"

---

### Test 2: Frontend Loading

**Browser:**
```
http://localhost:3000
```

**Expected:**
- Page loads successfully
- Instagram gradient header visible
- Disclaimer section visible
- Input field ready for URL
- No console errors

---

### Test 3: API Connection

1. Open frontend: http://localhost:3000
2. Paste a sample URL: `https://www.instagram.com/reel/test123/`
3. Click "Fetch Reel"
4. Expected: Error message (expected behavior) with educational notes

**Note:** The reel won't load (expected), but you should see proper error handling.

---

### Test 4: Network Tab Check

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Submit a URL in the app
4. Check for:
   - POST request to `http://localhost:5000/api/reel`
   - Response (even if error)
   - No CORS errors

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID_NUMBER>

# Or change port in backend/.env
PORT=5001
```

---

### Issue 2: Module Not Found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 3: CORS Error

**Error in browser console:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**

1. Check backend is running
2. Verify `FRONTEND_URL` in `backend/.env`
3. Check CORS middleware in `backend/server.js`

---

### Issue 4: Next.js Build Errors

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**

Ensure you're in the frontend directory:
```bash
cd frontend
npm install
```

---

### Issue 5: Fetch Fails Immediately

**Error:** "Cannot connect to backend server"

**Checklist:**
- [ ] Backend is running on port 5000
- [ ] Frontend `.env.local` has correct API URL
- [ ] No firewall blocking localhost
- [ ] Check browser console for errors

**Test backend manually:**
```bash
curl http://localhost:5000/health
```

---

### Issue 6: Instagram Returns 403/429

**This is expected!** Instagram blocks scraping attempts.

**Educational Note:** This demonstrates why the project exists - to show that scraping is unreliable and violates Terms of Service.

---

## 📱 Usage Instructions

### How to Test the Application

1. **Start both servers** (backend and frontend)

2. **Find a public Instagram Reel**
   - Open Instagram in your browser
   - Find any public reel
   - Copy the URL (e.g., `https://www.instagram.com/reel/ABC123XYZ/`)

3. **Paste URL in the app**
   - Go to http://localhost:3000
   - Paste the URL in the input field
   - Click "Fetch Reel"

4. **Observe the result**
   - ✅ Success: Video player with metadata (rare)
   - ❌ Error: Error message with educational notes (common)

5. **Expected Outcomes:**
   - Most attempts will fail (this is normal)
   - Failures demonstrate why scraping is unreliable
   - Errors include educational explanations

---

## 🎓 Development Workflow

### Making Changes to Backend

1. Edit files in `backend/` folder
2. Server auto-restarts (using nodemon)
3. Test changes by making API requests

### Making Changes to Frontend

1. Edit files in `frontend/` folder
2. Browser auto-refreshes (Next.js hot reload)
3. Check browser for updates

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- JavaScript (ES6) code snippets

---

## 📊 Project Structure Quick Reference

```
backend/
├── controllers/      # Request handlers
├── routes/          # API endpoints
├── services/        # Business logic
├── server.js        # Main entry point
├── package.json     # Dependencies
└── .env            # Configuration

frontend/
├── app/            # Next.js app directory
│   ├── layout.js   # Root layout
│   ├── page.js     # Home page
│   └── globals.css # Global styles
├── components/     # React components
├── package.json    # Dependencies
└── .env.local     # Configuration
```

---

## 🔧 Useful Commands

### Backend Commands

```bash
# Start development server (auto-restart)
npm run dev

# Start production server
npm start

# Install new package
npm install <package-name>
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:5000 | API server |
| Health Check | http://localhost:5000/health | Server status |
| Test Endpoint | http://localhost:5000/api/reel/test | API test |

---

## 📚 Next Steps

After successful setup:

1. **Read the Documentation**
   - [README.md](README.md) - Project overview
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details

2. **Experiment with the Code**
   - Try different error scenarios
   - Modify UI components
   - Add console logs to trace flow

3. **Learn the Concepts**
   - Why scraping fails
   - How Instagram blocks scrapers
   - Legal alternatives

4. **Build Legal Alternatives**
   - Video hosting platform
   - Use official APIs
   - Create original content

---

## ⚠️ Important Reminders

1. **This is for education only**
   - Never use in production
   - Violates Instagram ToS
   - Expect failures

2. **Keep servers running**
   - Both backend and frontend needed
   - Watch for errors in terminals

3. **Check browser console**
   - F12 to open DevTools
   - Look for errors/warnings
   - Network tab shows requests

4. **Expected behavior**
   - Most fetch attempts will fail
   - This demonstrates the lesson
   - Failures are educational

---

## 🆘 Getting Help

If you encounter issues:

1. **Check terminal output** for error messages
2. **Check browser console** (F12)
3. **Verify prerequisites** are met
4. **Review troubleshooting section** above
5. **Check if both servers are running**

---

## ✅ Setup Complete!

If you can:
- ✅ Access http://localhost:3000
- ✅ See the UI load properly
- ✅ Submit a URL and get a response (even if error)
- ✅ See educational messages

**Congratulations!** Your setup is complete. Now you can explore the codebase and learn why web scraping is problematic and how to build legal alternatives instead.

---

## 📖 What to Learn Next

1. **Explore the Code**
   - Read through `backend/services/instagramScraper.js`
   - Understand HTML parsing logic
   - See error handling strategies

2. **Test Edge Cases**
   - Invalid URLs
   - Private reels
   - Expired URLs

3. **Study the Failures**
   - Why 403 errors occur
   - How rate limiting works
   - Why video URLs expire

4. **Build Something Legal**
   - Create your own video platform
   - Use official APIs
   - Host your own content

---

Happy Learning! 🎓
