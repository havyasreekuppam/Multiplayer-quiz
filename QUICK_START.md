# 🚀 Quick Start Reference

## One-Command Setup (Automated)

### On macOS/Linux:
```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend (in new terminal)
cd client && npm install && npm start
```

## Manual Setup Steps

### 1️⃣ Start Backend
```bash
cd server
npm install
npm run dev
```
✅ Should see: "Server running on http://localhost:5000"

### 2️⃣ Start Frontend (New Terminal)
```bash
cd client  
npm install
npm start
```
✅ Should see: "Compiled successfully!" and browser opens

### 3️⃣ Test in Browser
- Go to http://localhost:3000
- Enter username and click "Start Playing"
- Create a room or join with code
- Open another browser tab/window for second player

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MongoDB connection error | Make sure `mongod` is running |
| Port 5000 in use | Change `PORT=5001` in `.env` |
| CORS errors | Backend CORS already configured |
| Socket not connecting | Check backend is running on port 5000 |
| Questions not loading | Restart backend (questions auto-seed) |
| React app not compiling | Delete `node_modules` and run `npm install` again |

## File Structure Quick Guide

```
📁 server/
  📄 server.js - Main server file (START HERE)
  📁 models/ - Database schemas
  📁 routes/ - API endpoints
  📁 controllers/ - Business logic
  📁 sockets/ - Real-time events
  📄 .env - Configuration

📁 client/
  📁 src/
    📁 pages/ - Page components
    📁 components/ - Reusable components
    📁 context/ - Global state (QuizContext)
    📄 App.js - Main app (START HERE)
  📄 package.json - Dependencies
```

## Key Socket Events

**Admin emits:** `startQuiz` → Server broadcasts → All see first question

**Player emits:** `submitAnswer` → Server processes → All see leaderboard update

**Admin emits:** `nextQuestion` → Server broadcasts → All see next question

## Development Tips

1. **Hot Reload:** 
   - Backend: Changes auto-reload with `nodemon`
   - Frontend: Changes auto-reload on save

2. **Debug Console:**
   - Browser F12 → Console tab → See Socket.io messages
   - Backend terminal → See all API calls and Socket events

3. **Test Multiplayer:**
   - Chrome main + Firefox second window
   - Or Chrome + Chrome incognito
   - Both at http://localhost:3000

4. **Sample Questions:**
   - Auto-generated on first backend start
   - Check MongoDB: `mongosh` → `use quiz-battle` → `db.questions.find()`

## Performance Tips

- ✅ Questions cache automatically
- ✅ Images use optimized loading
- ✅ Socket events batched efficiently
- ✅ Leaderboard updates debounced

## Next Steps After Setup

1. ✅ Create multiple rooms
2. ✅ Test with 2+ players
3. ✅ Check leaderboard updates
4. ✅ Verify admin controls work
5. ✅ Explore code structure
6. ✅ Add your own questions/features!

## Get Help

- Check browser console (F12) for errors
- Check backend terminal for API logs
- Read `ARCHITECTURE.md` for detailed flow
- Read `SETUP.md` for troubleshooting

---

**That's it! You're ready to quiz! 🎯**
