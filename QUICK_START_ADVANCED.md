# QUICK START: NEW FEATURES

Quick reference guide for implementing and using new advanced features.

## 1️⃣ Ranking System

### Quick Setup

1. **Install dependencies** (already in package.json)
2. **Ranking will auto-initialize** first time a user plays ranked

### Using ELO System

```javascript
// Backend: Calculate ELO change
import { calculateELOChange, getLevelFromELO } from './utils/eloCalculator.js';

const eloChange = calculateELOChange(1000, 900, true); // winner
const newLevel = getLevelFromELO(1050);

// API to update rankings
POST /api/rankings/update-after-match {
  winnerId, loserId, winnerScore, loserScore
}
```

### Display Rankings

```javascript
// Frontend: Show player ranking
const [ranking, setRanking] = useState(null);

useEffect(() => {
  fetch(`/api/rankings/player/${userId}`)
    .then(r => r.json())
    .then(d => setRanking(d.ranking));
}, [userId]);

// Display: {ranking.eloRating} - {ranking.level}
```

---

## 2️⃣ Public Quiz Mode

### Create Public Room

```javascript
// Frontend
const createRoom = async () => {
  const res = await fetch('/api/public-rooms/create', {
    method: 'POST',
    body: JSON.stringify({
      roomName: 'Science Quiz',
      category: 'Science',
      username: user.username,
      userId: user.id,
      isRanked: false
    })
  });
  const data = await res.json();
  console.log(data.room.roomId); // Use this to play
};
```

### Browse Rooms

```javascript
// Frontend
const browseRooms = async (category) => {
  const res = await fetch(`/api/public-rooms?category=${category}&page=1`);
  const { rooms } = await res.json();
  // Display rooms list
};
```

### Host Controls

```javascript
// Admin kicks player
POST /api/public-rooms/kick {
  roomId, playerId, adminId
}

// Admin pauses quiz
POST /api/public-rooms/pause {
  roomId, adminId
}
```

---

## 3️⃣ Analytics Dashboard

### Add to Navigation

Already added! Check sidebar:
- New "Analytics" menu item (📈)
- Click to view stats dashboard

### View Your Stats

1. Click "Analytics" in sidebar
2. See cards: Total Games, Win Rate, Avg Score, Best Score
3. View charts and rankings

### API Endpoints

```bash
# Get match stats
GET /api/matches/stats/:userId

# Get ranking
GET /api/rankings/player/:userId
```

---

## 4️⃣ Performance Optimization

### Use Lazy Loading

```javascript
// Frontend: Lazy load heavy components
const AnalyticsDashboard = React.lazy(() => 
  import('./pages/AnalyticsDashboard')
);

<Suspense fallback={<Loading />}>
  <AnalyticsDashboard />
</Suspense>
```

### Batch Socket Events

```javascript
// Backend should batch events
import { SocketEventBatcher } from './utils/performanceOptimization';

const batcher = new SocketEventBatcher(socket, 1000);
batcher.batch('scoreUpdate', { score: 100 });
// Sends once per second instead of immediately
```

### Cache Queries

```javascript
// Backend: Cache API responses
import { cacheQuery } from './utils/queryCache';

const questions = await cacheQuery(
  'questions_key',
  () => Question.find(),
  300 // 5 min cache
);

// Invalidate when needed
queryCache.invalidatePattern('questions');
```

---

## 5️⃣ Deployment

### Deploy Frontend (Vercel)

```bash
cd client
npm install -g vercel
vercel --prod

# Or use GitHub integration
```

### Deploy Backend (Render)

```bash
# Push to GitHub with render.yaml
git push origin main

# Auto-deploys via Render
```

### Setup Environment

1. Create `.env.production` files
2. Add to hosting platform dashboard
3. Re-deploy

---

## 📊 Architecture Overview

```
Frontend (React + Vercel)
    ↓↑ HTTP/WebSocket
Backend (Node.js + Render)
    ↓↑ Database queries
MongoDB (Atlas Cloud)
```

---

## 🧪 Testing New Features

### Test Ranking System

```bash
# 1. Create user and play ranked game
# 2. Check endpoints:
curl http://localhost:5000/api/rankings/player/userId
curl http://localhost:5000/api/rankings/leaderboard

# 3. Verify ELO changes
# 4. Check level progression
```

### Test Public Rooms

```bash
# 1. Create public room
curl -X POST http://localhost:5000/api/public-rooms/create \
  -H "Content-Type: application/json" \
  -d '{"roomName":"Test","category":"Science","username":"tester","userId":"123"}'

# 2. Browse rooms
curl http://localhost:5000/api/public-rooms

# 3. Join room and test host controls
```

### Test Analytics

```bash
# 1. Play several games
# 2. Navigate to Analytics tab
# 3. Verify stats display correctly
# 4. Check if charts render
```

---

## 🚀 Installation Checklist

- [ ] Install dependencies: `npm install` in both folders
- [ ] Add Recharts: `npm install recharts`
- [ ] Create `.env` files with correct variables
- [ ] Test locally: `npm run dev` (backend), `npm start` (frontend)
- [ ] Create MongoDB database
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Test production endpoints
- [ ] Monitor logs for errors
- [ ] Share with users!

---

## API Quick Reference

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| Ranking | `/rankings/player/:id` | GET | Get player ELO |
| Leaderboard | `/rankings/leaderboard` | GET | Global rankings |
| Update Ranking | `/rankings/update-after-match` | POST | Update after game |
| Create Room | `/public-rooms/create` | POST | Create public room |
| Browse Rooms | `/public-rooms` | GET | List public rooms |
| Kick Player | `/public-rooms/kick` | POST | Remove from room |
| Pause Quiz | `/public-rooms/pause` | POST | Pause game |
| Game Stats | `/matches/stats/:id` | GET | View statistics |

---

Need more details? Check:
- `ADVANCED_FEATURES.md` - Detailed documentation
- `DEPLOYMENT_CONFIG.md` - Deployment guide
- Code comments in implementation files
