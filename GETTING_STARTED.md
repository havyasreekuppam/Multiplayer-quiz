# 🎯 Getting Started - Complete Tutorial

## 👋 Welcome to Quiz Battle!

This guide walks you through setup and basic usage step-by-step.

## ⏱️ Time Required
- Setup: 10-15 minutes
- First game: 5 minutes

## 🛠️ Prerequisites

Before starting, ensure you have:
- **Node.js 14+** - https://nodejs.org/
- **MongoDB** - https://www.mongodb.com/
- **Git** (optional) - https://git-scm.com

## 📝 Step-by-Step Guide

### Step 1: Database Setup (5 min)

**Option A: Local MongoDB**

```bash
# macOS (using Homebrew)
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt install mongodb
sudo systemctl start mongod

# Windows
# Download installer from mongodb.com
# Follow installer instructions
```

**Option B: MongoDB Atlas (Cloud)**

1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env` with connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-battle
   ```

### Step 2: Backend Setup (3 min)

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Start server
npm run dev
```

✅ You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on http://localhost:5000
📡 Socket.io ready for connections
✅ Sample questions seeded successfully
```

### Step 3: Frontend Setup (3 min)

**In a new terminal tab:**

```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start React
npm start
```

✅ Browser will open at http://localhost:3000

### Step 4: Create Your First Game (5 min)

**Terminal 1 - Enter Username**
1. Type username (e.g., "Player1")
2. Click "Start Playing"

**Create Room**
1. Click "Create Room"
2. Enter room name (e.g., "Tech Quiz")
3. Select category (e.g., "Tech")
4. Click "Create Room"
5. Copy the room code displayed

**Terminal 2 - Join Game**
1. Open new browser tab/incognito window
2. Go to http://localhost:3000
3. Enter different username (e.g., "Player2")
4. Click "Start Playing"
5. Click "Join Room"
6. Paste the room code
7. Click "Join Room"

**Start Quiz**
1. In Player1 window, click "Start Quiz"
2. Both players see first question
3. Select answer and click "Submit Answer"
4. Click "Next Question" (Player1 only)
5. Repeat for all questions

**See Results**
1. Final leaderboard shows winner
2. Final score for each player
3. Statistics cards show highlights

## 🎮 How to Play

### Game Phases

**Phase 1: Waiting Room**
- See list of players
- Admin starts when ready
- Minimum 2 players needed

**Phase 2: Quiz**
- Answer questions within time limit
- See your score update
- Watch leaderboard change in real-time

**Phase 3: Results**
- See final rankings
- Check who won
- View statistics

### Scoring

- **Base score:** 100 points per correct answer
- **Speed bonus:** Deduct seconds taken
- **Formula:** 100 - time_taken = points
- **Example:** Answer in 5 seconds = 95 points
- **Wrong answer:** 0 points

### Quiz Rules

- 🕐 **15 seconds per question**
- 📊 **Questions show one by one**
- ⚡ **Score calculated instantly**
- 🏆 **Leaderboard live updates**
- 🏁 **Last ranking is final score**

## ⚙️ Customization

### Change Number of Questions

**Dashboard.js:**
```javascript
setQuestionsInput(10) // Default 10 questions instead of 5
```

### Change Question Time

**Quiz.js:**
```javascript
const timeLimit = 20; // 20 seconds instead of 15
```

### Add New Category

1. Backend Model: `server/models/Question.js`
2. Add to enum: `'NewCategory'`
3. Add questions in: `server/routes/questionRoutes.js`
4. Frontend: `Dashboard.js` - Add option

### Change Colors

**Tailwind CSS** - Edit color classes:
```javascript
// Changes purple to your preferred color
// Search for "purple-600" in component files
// Replace with "blue-600", "green-600", etc.
```

## 🐛 Common Issues

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If fails, start it:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: Start MongoDB service in Services
```

### Issue: "Port 5000 already in use"

**Solution - Option 1:** Kill existing process
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Solution - Option 2:** Change port
```bash
# Edit server/.env
PORT=5001

# Restart backend
```

### Issue: "React app not connecting"

**Solution:**
1. Check backend is running on port 5000
2. Check browser console (F12)
3. Look for WebSocket connection errors
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart both servers

### Issue: "Questions not loading"

**Solution:**
1. Restart backend (Ctrl+C, then npm run dev)
2. Check MongoDB is running
3. Check database: `mongosh` → `use quiz-battle` → `db.questions.find()`

## 📚 Learn More

- **README.md** - Overview of features
- **QUICK_START.md** - Quick reference
- **ARCHITECTURE.md** - System design
- **DEVELOPER_GUIDE.md** - Code structure
- **FILE_STRUCTURE.md** - File organization

## 🔥 Next Steps

1. ✅ Try with 3+ players
2. ✅ Test different categories
3. ✅ Explore the code
4. ✅ Add new questions
5. ✅ Deploy to production
6. ✅ Share with friends!

## 🎯 Tips & Tricks

- 💡 **Multiple Windows:** Use Chrome + Firefox for local testing
- 🔐 **Copy Room Code:** Click copy button to easily share
- ⚡ **Fast Answers:** Answer quickly for more points
- 📊 **Watch Leaderboard:** See changes in real-time during quiz
- 🎨 **Theme:** Dark theme is easier on the eyes
- 🚀 **Mobile:** Responsive design works on phones too

## ❓ FAQ

**Q: Can I play alone?**
A: No, minimum 2 players required to start.

**Q: Can I change questions after room created?**
A: No, questions are locked when room is created.

**Q: Can I rejoin a room?**
A: Only if quiz hasn't started yet.

**Q: Are scores saved?**
A: Yes! Check MongoDB - users collection has total scores.

**Q: Can I add my own questions?**
A: Yes! Edit `server/routes/questionRoutes.js` and add questions to the array.

## 🎉 You're Ready!

You now have a fully functional multiplayer quiz platform!

Start playing and have fun! 🎯

---

**Need help?** Check the troubleshooting section in `SETUP.md`
