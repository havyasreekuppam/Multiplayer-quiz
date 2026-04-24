# ADVANCED FEATURES GUIDE

## Overview

This guide covers the advanced features added to enhance the Quiz Battle platform:

1. **Ranking System** - ELO rating, player levels, and competitive tracking
2. **Live Public Quiz Mode** - Browsable public rooms with host controls
3. **Analytics Dashboard** - Comprehensive statistical tracking with charts
4. **Performance Optimization** - Lazy loading, caching, and socket optimization
5. **Deployment Enhancements** - Production-ready configurations for Vercel, Render, and Kubernetes

---

## 1. Ranking System

### Overview
The ELO ranking system provides competitive skill-based matchmaking and player progression through levels.

### Features
- **ELO Rating**: Starts at 1000 points
- **Multiple Levels**: Bronze → Silver → Gold → Platinum → Diamond
- **Progress Tracking**: See advancement within each level
- **Badges**: Unlock achievements through gameplay
- **Season Stats**: Track performance across seasons
- **Win Streak**: Monitor current and best win streaks

### Database Schema

```javascript
// Ranking Model
{
  userId: ObjectId,           // Reference to User
  eloRating: 1000,           // Current ELO (0-∞)
  level: "Bronze",           // Current level
  levelProgress: 0-100,      // Progress to next level
  totalRankedGames: 0,       // Total ranked matches
  rankedWins: 0,             // Wins in ranked mode
  winStreak: 0,              // Current streak
  bestWinStreak: 0,          // Best streak achieved
  lastRankedMatch: Date,     // Last match timestamp
  badges: [],                // Earned achievements
  seasonStats: {}            // Season-specific data
}
```

### ELO Calculation

The system uses the standard chess ELO formula adapted for multiplayer:

```javascript
// Example calculation
expectedScore = 1 / (1 + 10^((loserRating - winnerRating) / 400))
eloChange = K_FACTOR * (actualScore - expectedScore)

// K_FACTOR = 32 (determines volatility)
```

### API Endpoints

#### Get Player Ranking
```bash
GET /api/rankings/player/:userId
```

Response:
```json
{
  "success": true,
  "ranking": {
    "eloRating": 1250,
    "level": "Silver",
    "levelProgress": 45,
    "totalRankedGames": 15,
    "rankedWins": 9,
    "winStreak": 3,
    "bestWinStreak": 7,
    "badges": [
      {"name": "On Fire 🔥", "description": "Win streak of 5+"},
      {"name": "Veteran ⭐", "description": "50 ranked wins"}
    ]
  }
}
```

#### Get Global Leaderboard
```bash
GET /api/rankings/leaderboard?limit=100&page=1
```

#### Compare Two Players
```bash
GET /api/rankings/compare?userId1=id1&userId2=id2
```

#### Update After Match
```bash
POST /api/rankings/update-after-match
{
  "matchId": "match123",
  "winnerId": "user1",
  "loserId": "user2",
  "winnerScore": 850,
  "loserScore": 450
}
```

### Level System

| Level | ELO Range | Next Level |
|-------|-----------|-----------|
| Bronze | 0-1200 | 1200 ELO |
| Silver | 1200-1400 | 1400 ELO |
| Gold | 1400-1800 | 1800 ELO |
| Platinum | 1800-2400 | 2400 ELO |
| Diamond | 2400+ | ∞ |

### Backend Implementation

**File**: `/server/utils/eloCalculator.js`
- `calculateELOChange()` - Compute rating change
- `calculateNewELO()` - Calculate new rating
- `getLevelFromELO()` - Determine level
- `getLevelProgress()` - Calculate progress %
- `checkBadges()` - Unlock achievements

**File**: `/server/controllers/rankingController.js`
- Manage ranking data
- Update after matches
- Generate leaderboards
- Compare players

---

## 2. Live Public Quiz Mode

### Overview
Public rooms allow players to create browsable quiz sessions without needing an invite code.

### Features
- **Public Room Creation**: Create rooms visible to all players
- **Browse Rooms**: Discover active public quizzes
- **Host Controls**:
  - Kick players from room
  - Pause/Resume quiz mid-game
  - Manage room settings
- **Ranked Mode**: Option to play ranked matches in public rooms
- **Category Filtering**: Browse by quiz category

### Database Updates

The Room model includes new fields:

```javascript
{
  roomId: String,
  roomName: String,
  isPublic: boolean,        // NEW: Public visibility
  isRanked: boolean,        // NEW: Ranked mode flag
  adminId: ObjectId,        // NEW: Room creator
  hostControls: {           // NEW: Admin permissions
    canKick: true,
    canPause: true,
    canRestart: true
  },
  maxPlayers: 8,            // NEW: Player capacity
  status: "WAITING"         // WAITING, ACTIVE, PAUSED, FINISHED
}
```

### API Endpoints

#### Create Public Room
```bash
POST /api/public-rooms/create
{
  "roomName": "Science Quiz Night",
  "category": "Science",
  "username": "host_player",
  "userId": "user123",
  "isRanked": false
}
```

#### Browse Public Rooms
```bash
GET /api/public-rooms?category=Science&isRanked=false&limit=20&page=1
```

Response:
```json
{
  "success": true,
  "rooms": [
    {
      "roomId": "room_1234567",
      "roomName": "Science Quiz Night",
      "category": "Science",
      "admin": "host_player",
      "playersCount": 3,
      "maxPlayers": 8,
      "isRanked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 5
  }
}
```

#### Kick Player
```bash
POST /api/public-rooms/kick
{
  "roomId": "room_1234567",
  "playerId": "user456",
  "adminId": "user123"
}
```

#### Pause Quiz
```bash
POST /api/public-rooms/pause
{
  "roomId": "room_1234567",
  "adminId": "user123"
}
```

#### Resume Quiz
```bash
POST /api/public-rooms/resume
{
  "roomId": "room_1234567",
  "adminId": "user123"
}
```

### Frontend Integration

#### Create Public Room
```javascript
// client/src/components/CreatePublicRoomModal.js
const createPublicRoom = async (roomName, category, isRanked) => {
  const response = await fetch(`${API_URL}/public-rooms/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      roomName,
      category,
      username: user.username,
      userId: user.id,
      isRanked
    })
  });
  return response.json();
};
```

#### Browse Rooms
```javascript
// client/src/pages/PublicRoomsPage.js
const fetchPublicRooms = async (category, isRanked, page) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (isRanked) params.append('isRanked', isRanked);
  params.append('page', page);

  const response = await fetch(`${API_URL}/public-rooms?${params}`);
  return response.json();
};
```

---

## 3. Analytics Dashboard

### Overview
Comprehensive statistics dashboard with visual charts and performance metrics.

### Features
- **Game Statistics**: Total games, win rate, average score
- **Ranking Info**: Current ELO, level, progress
- **Visual Charts**:
  - Win/Loss distribution (Pie Chart)
  - Score comparison (Bar Chart)
  - Performance trends (Line Chart)
- **Achievements**: Display earned badges
- **Season Stats**: Track ranked performance

### Frontend Component

**File**: `/client/src/pages/AnalyticsDashboard.js`

```javascript
import React, { useEffect, useState } from 'react';
import { BarChart, PieChart, LineChart } from 'recharts';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-dashboard">
      <StatCards stats={stats} />
      <RankingCard ranking={ranking} />
      <ChartsSection stats={stats} />
      <AchievementsSection badges={ranking?.badges} />
    </div>
  );
}
```

### API Calls

#### Get Match Statistics
```bash
GET /api/matches/stats/:userId
```

Response:
```json
{
  "success": true,
  "stats": {
    "totalGames": 47,
    "wins": 35,
    "losses": 12,
    "averageScore": 742.5,
    "bestScore": 980,
    "playTime": 3600000
  }
}
```

#### Get Player Ranking
```bash
GET /api/rankings/player/:userId
```

### Stat Cards

Display key metrics:
- **Total Games**: Number of matches played
- **Win Rate**: Percentage (Win Rate = wins / totalGames * 100)
- **Average Score**: Mean score across all games
- **Best Score**: Highest score achieved

### Charts

#### Win/Loss Distribution (Pie Chart)
- Green: Wins
- Red: Losses
- Percentage labels

#### Score Comparison (Bar Chart)
- Average Score
- Best Score
- Y-axis: Score value
- Color: Blue gradient

### Integration in Sidebar

Add Analytics tab to navigation:

```javascript
{ id: 'analytics', label: 'Analytics', icon: '📈' }
```

---

## 4. Performance Optimization

### Overview
Advanced optimization techniques to improve application performance.

### Techniques

#### 1. Lazy Loading Components

**File**: `/client/src/utils/performanceOptimization.js`

```javascript
// Lazy load route components
const LazyDashboard = React.lazy(() => import('./pages/Dashboard'));
const LazyAnalytics = React.lazy(() => import('./pages/AnalyticsDashboard'));

// Usage with Suspense
<Suspense fallback={<SkeletonLoader />}>
  <LazyDashboard />
</Suspense>
```

#### 2. Socket Event Batching

Reduce socket event frequency by batching multiple updates:

```javascript
import { SocketEventBatcher } from '../utils/performanceOptimization';

const batcher = new SocketEventBatcher(socket, 1000); // Flush every 1s

// Instead of emitting individually
socket.emit('answerSubmitted', answer); // No!

// Batch updates
batcher.batch('answerSubmitted', answer); // Yes!
```

#### 3. Query Caching

**File**: `/server/utils/queryCache.js`

```javascript
import { cacheQuery, queryCache } from './utils/queryCache';

// Cached query with 5-minute TTL
const questions = await cacheQuery(
  'questions_list',
  () => Question.find(),
  300 // 5 minutes
);

// Invalidate cache when data changes
queryCache.invalidatePattern('questions');
```

#### 4. React Memoization

```javascript
import { withMemoization } from '../utils/performanceOptimization';

const QuestionCard = ({ question, onAnswer }) => {
  return <div>{question.text}</div>;
};

// Prevent unnecessary re-renders
export default withMemoization(QuestionCard, (prev, next) => {
  return prev.question.id === next.question.id;
});
```

#### 5. API Request Debouncing

```javascript
const [search, debouncedSearch] = useAsyncDebounce(
  async (query) => {
    const results = await fetchRooms(query);
    setRooms(results);
  },
  300 // 300ms delay
);

// Usage
<input
  type="text"
  onChange={(e) => search(e.target.value)}
/>
```

### Measurement

Benchmark before/after:

```javascript
console.time('renderingTime');
// Component render
console.timeEnd('renderingTime');

// Using React DevTools Profiler
// Browser DevTools → Record → Identify slow renders
```

---

## 5. Deployment Enhancements

### Overview
Production-ready configurations for multiple deployment platforms.

### Configuration Files

#### Vercel Deployment (Frontend)

**File**: `/client/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Deployment**:
```bash
npm install -g vercel
vercel --prod

# Or connect GitHub repo for CI/CD
```

#### Vercel Deployment (Backend)

**File**: `/server/vercel.json`

```json
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "/server.js"}]
}
```

#### Render Deployment

**File**: `/render.yaml`

```yaml
services:
  - type: web
    name: quiz-battle-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: ${{ secrets.MONGODB_URI }}
```

**Deployment**:
1. Connect GitHub repo to Render
2. Select `/server` directory
3. Add environment variables in dashboard
4. Deploy

#### Kubernetes Deployment

**File**: `/kubernetes-deployment.yaml`

```bash
# Deploy to Kubernetes cluster
kubectl apply -f kubernetes-deployment.yaml

# Check deployment
kubectl get deployments
kubectl logs deployment/quiz-battle-api
```

### Environment Variables

Create appropriate `.env` files:

**Backend** (`server/.env`):
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiz-battle
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=https://your-frontend.vercel.app
OPENAI_API_KEY=sk-xxxxx
NODE_ENV=production
```

**Frontend** (`client/.env`):
```
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_SOCKET_URL=https://your-backend.com
```

### Database Setup

MongoDB Atlas (Cloud):
```
1. Create cluster
2. Get connection string
3. Add to MONGODB_URI
4. Whitelist IPs
```

### SSL/HTTPS

- **Vercel**: Automatic SSL
- **Render**: Automatic SSL
- **Custom Domain**: Configure DNS records

### Performance Tuning

1. **Enable Caching**:
```javascript
// In server.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

2. **Gzip Compression**:
```javascript
import compression from 'compression';
app.use(compression());
```

3. **Rate Limiting**:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### Monitoring

- **Vercel**: Dashboard analytics
- **Render**: Logs and metrics
- **MongoDB Atlas**: Performance advisor
- **Custom**: New Relic, Datadog, or Sentry

### CI/CD Pipeline

GitHub Actions example:

```yaml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install && npm run build
      - run: npm test
      - run: npm run deploy
```

---

## Implementation Checklist

- [ ] Ranking system integrated
- [ ] Public rooms working
- [ ] Analytics dashboard displaying
- [ ] Performance optimizations applied
- [ ] Vercel frontend deployed
- [ ] Render backend deployed
- [ ] Environment variables configured
- [ ] Database backups set up
- [ ] Monitoring enabled
- [ ] SSL certificates active

---

## Troubleshooting

### ELO Not Updating
- Check `/api/rankings/update-after-match` endpoint
- Verify user IDs are valid
- Check MongoDB connection

### Public Rooms Not Showing
- Verify `isPublic: true` in Room model
- Check status is "WAITING"
- Test pagination parameters

### Analytics Empty
- Ensure matches are being saved
- Check match timestamps
- Verify user authentication

### Performance Issues
- Profile with React DevTools
- Monitor socket event frequency
- Check database query performance

---

## Next Steps

1. Install new dependencies: `npm install recharts`
2. Test all new features locally
3. Deploy to staging environment
4. Run load tests
5. Deploy to production
6. Monitor metrics and adjust

---

**Need Help?**
Refer to individual feature sections or contact the development team.
