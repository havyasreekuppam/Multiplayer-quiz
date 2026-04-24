# 🚀 SETUP & INSTALLATION GUIDE

Complete step-by-step guide to set up and run the enhanced Quiz Battle Platform locally.

## Prerequisites

- **Node.js**: 14.0.0+ (download from [nodejs.org](https://nodejs.org))
- **npm**: 6.0.0+ (comes with Node.js)
- **MongoDB**: 4.0+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud)
- **Git**: For version control
- **Text Editor**: VS Code recommended

## Installation Steps

### Step 1: Clone Repository

```bash
# Navigate to your projects folder
cd ~/projects

# Clone the repo (or download as zip)
git clone <your-repo-url>
cd Multiplayer

# Verify structure
ls -la
# Should show: server/ client/ ADVANCED_FEATURES.md etc.
```

### Step 2: Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# You should see:
# ✓ express (4.18.2)
# ✓ mongoose (7.0.0)
# ✓ socket.io (4.5.4)
# ✓ bcryptjs (2.4.3)
# ✓ jsonwebtoken (9.0.0)
# ... and more

# Verify installation
npm list

# Should show: quiz-battle-server@1.0.0
```

### Step 3: Backend Configuration

```bash
# From /server directory
# Create .env file
cp .env.example .env

# Edit .env file (use your favorite editor)
nano .env
# Or in VS Code: 
# File → Open → server/.env
```

**Fill in required values**:

```
# Database (Local MongoDB)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz_battle
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz_battle?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-secret-key-here
# Generate: openssl rand -base64 32

# Frontend URL
CORS_ORIGIN=http://localhost:3000

# Optional: OpenAI API
OPENAI_API_KEY=sk-your-api-key-here

# Environment
NODE_ENV=development
```

### Step 4: Database Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB locally (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
# Type: exit

# Create database
mongosh
> use quiz_battle
> db.createCollection("users")
> exit
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up (free account)
3. Create cluster (Shared tier, free)
4. Wait 3-5 minutes
5. Create Database User
6. Get connection string
7. Add to `.env` MONGODB_URI

### Step 5: Test Backend

```bash
# From /server directory
npm run dev

# You should see:
# ✓ Server running on port 5000
# ✓ MongoDB connected successfully
# ✓ Questions seeded
# ✓ Socket.io ready

# Keep this terminal open!
```

**Test API**:
```bash
# Open another terminal
curl http://localhost:5000/api/health
# Response: {"status":"Server is running ✅"}
```

### Step 6: Frontend Setup

```bash
# Open new terminal
cd client
cd ~/projects/Multiplayer/client

# Install dependencies
npm install

# You should see:
# ✓ react (18.2.0)
# ✓ react-router-dom (6.11.0)
# ✓ socket.io-client (4.5.4)
# ✓ recharts (2.10.0) ← NEW!
# ... and more

# Verify installation
npm list

# Should show: quiz-battle-client@0.1.0
```

### Step 7: Frontend Configuration

```bash
# From /client directory
# Create .env file
cp .env.example .env

# Edit .env file
nano .env
```

**Fill in values**:

```
# Backend API
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Features (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_RANKING=true
```

### Step 8: Test Frontend

```bash
# From /client directory (Frontend terminal)
npm start

# You should see:
# ✓ Compiled successfully
# ✓ Webpack compiled
# ✓ Opening localhost:3000 in browser

# Browser opens automatically at http://localhost:3000
```

## Verify Complete Setup

### ✅ Checklist

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Frontend terminal shows "Compiled successfully"
- [ ] Browser opened at localhost:3000
- [ ] API health check works: `curl http://localhost:5000/api/health`
- [ ] Can see login page
- [ ] Can create account (try: user@test.com / password123)
- [ ] Can login
- [ ] Can see Dashboard with Quiz option

## Test New Features

### Test Ranking System

```bash
# 1. Create account: test1@test.com
# 2. Create another: test2@test.com
# 3. Play game as test1
# 4. Check leaderboard
# 5. Should see ELO rating
```

### Test Public Rooms

```bash
# 1. Login as test1
# 2. Click "Dashboard" 
# 3. Create public room
# 4. Open new browser (private/incognito)
# 5. Login as test2
# 6. Browse public rooms
# 7. See test1's room listed
```

### Test Analytics Dashboard

```bash
# 1. Play 3+ games
# 2. Click "Analytics" in sidebar
# 3. See stats cards
# 4. See charts rendering
# 5. View your ranking
```

## Common Issues

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**:
```bash
# Check MongoDB is running
brew services list | grep mongodb

# If not running:
brew services start mongodb-community

# Or use MongoDB Atlas instead
```

### Port 3000 Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Port 5000 Already in Use

```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### npm install Fails

```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

### Module Not Found Error

```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
Multiplayer/
├── server/                    # Backend (Node.js/Express)
│   ├── models/               # Database schemas
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── sockets/              # Socket.io events
│   ├── utils/                # Utilities
│   ├── server.js             # Main entry point
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
│
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Global state
│   │   ├── utils/            # Utilities
│   │   ├── App.js            # Main component
│   │   └── index.js          # Entry point
│   ├── public/
│   ├── .env                  # Environment variables
│   └── package.json          # Frontend dependencies
│
├── Documentation/
│   ├── ADVANCED_FEATURES.md       # Feature guide
│   ├── DEPLOYMENT_CONFIG.md       # Deployment guide
│   ├── QUICK_START_ADVANCED.md    # Quick reference
│   └── RELEASE_NOTES.md           # Release info
│
└── Configuration/
    ├── vercel.json            # Frontend deployment
    ├── render.yaml            # Backend deployment
    └── kubernetes-deployment.yaml # K8s config
```

## File Locations

### Important Frontend Files
- **Pages**: `client/src/pages/` → AnalyticsDashboard.js ← NEW
- **Components**: `client/src/components/` → Sidebar.js (updated)
- **Utilities**: `client/src/utils/` → performanceOptimization.js ← NEW
- **Config**: `client/.env` → Add your API URL here

### Important Backend Files
- **Models**: `server/models/` → Ranking.js ← NEW
- **Controllers**: `server/controllers/` → rankingController.js, publicRoomController.js ← NEW
- **Routes**: `server/routes/` → rankingRoutes.js, publicRoomRoutes.js ← NEW
- **Utils**: `server/utils/` → eloCalculator.js, queryCache.js ← NEW
- **Server**: `server/server.js` → Updated with new routes
- **Config**: `server/.env` → Add your MongoDB URL here

## Development Workflow

### Daily Development

```bash
# Terminal 1: Backend (from /server)
npm run dev
# Watches for changes, auto-restarts

# Terminal 2: Frontend (from /client)
npm start
# Watches for changes, hot-reloads browser

# Terminal 3: Optional - Database monitoring
mongosh
```

### Code Changes

1. **Backend**: Changes auto-detected by nodemon
2. **Frontend**: Changes auto-detected by react-scripts
3. **Database**: May need to restart if schema changes
4. **Socket.io**: Restart backend to apply live

### Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add new feature"

# Push
git push origin main
```

## Next Steps After Setup

1. ✅ Verify everything works locally
2. ✅ Read ADVANCED_FEATURES.md for all feature details
3. ✅ Play test games to understand the system
4. ✅ Check Analytics dashboard (📈 tab)
5. ✅ Try creating public rooms
6. ✅ Review API Reference in QUICK_START_ADVANCED.md
7. ✅ When ready, follow DEPLOYMENT_CONFIG.md for production

## Useful Commands

### Backend Commands
```bash
cd server

npm install          # Install dependencies
npm run dev         # Start with auto-reload
npm start           # Start normally (production)
npm test            # Run tests (if configured)
```

### Frontend Commands
```bash
cd client

npm install          # Install dependencies
npm start           # Start dev server
npm run build       # Create production build
npm test            # Run tests
npm run eject       # Eject from create-react-app (caution!)
```

### Database Commands
```bash
# MongoDB CLI
mongosh

# Common queries
show databases
use quiz_battle
show collections
db.users.find()
db.rankings.findOne()
```

### Testing APIs
```bash
# Get leaderboard
curl http://localhost:5000/api/rankings/leaderboard

# Get player ranking
curl http://localhost:5000/api/rankings/player/USER_ID

# Browse public rooms
curl http://localhost:5000/api/public-rooms

# Health check
curl http://localhost:5000/api/health
```

## System Monitoring

### Monitor Backend

```bash
# In server terminal, you'll see:
# [nodemon] restarting due to changes...
# Connected to MongoDB ✓
# Socket.io connection from client ✓
```

### Monitor Frontend

```bash
# In client terminal, you'll see:
# Compiled successfully! ✓
# webpack compiled in XX ms
```

### Monitor Database

```bash
# MongoDB Atlas Dashboard:
# 1. Go to mongodb.com/cloud/atlas
# 2. Select cluster
# 3. View metrics
# Connection count, query performance, storage
```

## Performance Testing

```bash
# Check API response time
time curl http://localhost:5000/api/rankings/leaderboard

# Check Socket connection
# Browser DevTools → Network → WS
# Look for successful WebSocket connection

# Check bundle size
cd client
npm run build
# Check size of build/ folder
```

## Troubleshooting Tips

1. **Clear everything and start fresh**:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. **Check all ports are correct**:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000
   - MongoDB: localhost:27017

3. **Use verbose logging**:
   ```bash
   DEBUG=* npm run dev
   ```

4. **Check environment variables**:
   ```bash
   cat server/.env
   cat client/.env
   ```

## 🎉 Success!

If you see:
- ✅ Backend running on 5000
- ✅ Frontend running on 3000
- ✅ Can login to application
- ✅ Analytics tab shows data
- ✅ Charts displaying correctly

**You're all set! The advanced features are working! 🚀**

---

Next: Read `ADVANCED_FEATURES.md` for complete feature documentation or `DEPLOYMENT_CONFIG.md` to deploy to production.
