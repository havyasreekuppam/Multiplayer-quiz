# 📚 Setup Instructions

## Quick Start Guide

### Step 1: Install MongoDB

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows
- Download from: https://www.mongodb.com/try/download/community
- Follow installer instructions
- Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo`

#### Linux (Ubuntu)
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file (already provided)
cat .env

# Start server
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on http://localhost:5000
📡 Socket.io ready for connections
✅ Sample questions seeded successfully
```

### Step 3: Frontend Setup

In a **new terminal/tab**:

```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start React app
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view quiz-battle-client in the browser.
Open http://localhost:3000
```

## ✅ Verification

1. **Backend health check:**
   ```bash
   curl http://localhost:5000/api/health
   # Response: { "status": "Server is running ✅" }
   ```

2. **Socket.io connection:**
   - Open React app in browser
   - Open browser console (F12)
   - Should see: "✅ Connected to server"

3. **MongoDB connection:**
   - Backend logs should show: "✅ MongoDB Connected"

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB

**Solution:**
```bash
# Make sure MongoDB is running
# Check status:
mongosh

# If connection fails, try:
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # macOS
```

### Issue: Port 5000 already in use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Issue: React app not connecting to backend

**Solution:**
1. Make sure backend is running on port 5000
2. Check CORS settings in `server.js`
3. Check browser console for errors (F12)
4. Clear browser cache and restart

### Issue: Socket.io connection timeout

**Solution:**
1. Ensure backend server is running
2. Check firewall settings
3. Try disabling browser extensions
4. Check browser console for specific errors

## 🔧 Development Commands

### Backend
```bash
cd server

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Just install packages
npm install
```

### Frontend
```bash
cd client

# Development mode
npm start

# Build for production
npm run build

# Run tests
npm test

# Install packages
npm install
```

## 📦 Installing Tailwind CSS

If Tailwind CSS is not installed:

```bash
cd client

# Install Tailwind and dependencies
npm install -D tailwindcss postcss autoprefixer

# Generate config files
npx tailwindcss init -p

# The Tailwind config files are already provided
```

## 🗄 MongoDB Collections

After starting the server, the following collections are auto-created:

- **users** - User profile data
- **questions** - Quiz questions (auto-populated)
- **rooms** - Active quiz rooms

To view data:

```bash
# Connect to MongoDB
mongosh

# Select database
use quiz-battle

# View collections
show collections

# View sample question
db.questions.findOne()

# View all questions
db.questions.find().pretty()
```

## 🚀 Deployment

### Deploy Backend (Vercel/Heroku)

1. Push code to GitHub
2. Connect repository to Vercel/Heroku
3. Set environment variables in dashboard
4. Ensure MongoDB Atlas is configured

### Deploy Frontend (Vercel/Netlify)

1. Build the app: `npm run build`
2. Deploy `build/` folder
3. Configure environment variables for API URL

## 📱 Testing the Application

1. **Open two browser windows:**
   - User 1: http://localhost:3000
   - User 2: http://localhost:3000

2. **Simulate multiplayer:**
   - User 1: Create room
   - User 2: Join room with room code
   - User 1: Start quiz
   - Both answer questions
   - Watch leaderboard update in real-time

## ✨ Next Steps

- Explore the code in different files
- Modify questions in `server/routes/questionRoutes.js`
- Customize UI in React components
- Add more features like private rooms, difficulty levels, etc.

Happy coding! 🎯
