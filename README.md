# � Quiz Battle - Production-Grade Multiplayer Quiz Platform

Enterprise-ready MERN stack application with advanced real-time multiplayer quizzes, secure authentication, AI integration, and comprehensive testing.

## ✨ Core Features

- ✅ **Real-Time Multiplayer Quizzes** - Socket.io powered synchronization
- ✅ **Secure Authentication** - JWT with refresh token rotation, httpOnly cookies
- ✅ **AI-Powered Questions** - OpenAI integration with fallback mechanism
- ✅ **ELO-Based Ranking System** - Competitive leaderboards with badges and levels
- ✅ **Public Quiz Rooms** - Browse and join public games with host controls
- ✅ **Analytics Dashboard** - Real-time statistics and performance tracking
- ✅ **Distributed Rate Limiting** - 5 different limiters (auth, API, WebSocket, AI)
- ✅ **Multi-Server Ready** - Redis adapter for horizontal scaling
- ✅ **Comprehensive Testing** - 48+ test cases with Jest + Supertest

## 🛠 Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.io** - Real-time WebSocket communication
- **Redis** - Distributed caching and rate limiting
- **Winston** - Structured logging
- **Jest + Supertest** - Comprehensive testing

### Frontend
- **React 18** - UI framework
- **Socket.io Client** - Real-time communication
- **React Testing Library** - Component testing
- **Tailwind CSS** - Responsive styling
- **Axios** - HTTP client

## 🏗️ System Architecture

## 📁 Project Structure

```
Multiplayer/
├── server/
│   ├── models/
│   │   ├── User.js                     # User schema with roles
│   │   ├── Question.js                 # Quiz questions
│   │   ├── Room.js                     # Game rooms
│   │   ├── Match.js                    # Match history
│   │   ├── Ranking.js                  # ELO ratings
│   │   └── RefreshToken.js             # Token management
│   │
│   ├── controllers/
│   │   ├── authController.js           # Auth with token rotation
│   │   ├── questionController.js       # Question management
│   │   ├── roomController.js           # Room management
│   │   ├── rankingController.js        # Ranking system
│   │   └── aiController.js             # AI integration
│   │
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   ├── advancedAuthMiddleware.js  # Role-based access control
│   │   ├── errorHandler.js             # Global error handler
│   │   └── rateLimiter.js              # Rate limiting
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # Auth endpoints
│   │   ├── questionRoutes.js           # Question endpoints
│   │   ├── roomRoutes.js               # Room endpoints
│   │   ├── rankingRoutes.js            # Ranking endpoints
│   │   ├── aiRoutes.js                 # AI endpoints
│   │   └── publicRoomRoutes.js         # Public room endpoints
│   │
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   ├── redis.js                    # Redis client & caching
│   │   └── socketIOAdapter.js          # Redis Socket.io adapter
│   │
│   ├── utils/
│   │   ├── logger.js                   # Winston logger
│   │   ├── aiQuestionGenerator.js      # OpenAI integration
│   │   └── gameStateManager.js         # Game state persistence
│   │
│   ├── sockets/
│   │   └── socketHandler.js            # Socket.io events
│   │
│   ├── __tests__/
│   │   ├── setup.js                    # Jest configuration
│   │   ├── auth.test.js                # 24 auth tests
│   │   ├── ranking.test.js             # 10 ranking tests
│   │   ├── quiz.test.js                # 8 quiz tests
│   │   └── gameState.test.js           # 6 game state tests
│   │
│   ├── server.js                       # Main server entry
│   ├── jest.config.js                  # Test configuration
│   ├── package.json                    # Dependencies
│   └── .env                            # Environment variables
│
└── client/
    ├── src/
    │   ├── components/                 # React components
    │   ├── pages/                      # Page components
    │   ├── context/                    # Auth & Quiz context
    │   ├── __tests__/
    │   │   ├── Dashboard.test.js       # Component tests
    │   │   └── useAuth.test.js         # Hook tests
    │   └── App.js                      # Main app
    ├── jest.config.js                  # Test configuration
    ├── package.json
    └── .env
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v14+ 
- **MongoDB** local or Atlas (cloud)
- **Redis** local or cloud
- **npm** or **yarn**

### Installation & Setup

#### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
# - JWT_SECRET=your-strong-secret
# - REFRESH_SECRET=your-refresh-secret
# - REDIS_HOST=localhost
# - REDIS_PORT=6379
# - OPENAI_API_KEY=sk-xxx (optional, has fallback)

# Verify setup
npm test
```

#### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Install client dependencies
npm install --save socket.io-client axios
```

#### 3. Start Services

**Terminal 1 - Start Redis**
```bash
redis-server
```

**Terminal 2 - Start Backend**
```bash
cd server
npm run dev

# Watch for output:
# 🚀 Server running on http://localhost:5000
# ✅ Socket.io Redis adapter configured successfully
```

**Terminal 3 - Start Frontend**
```bash
cd client
npm start

# Browser opens at http://localhost:3000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## � Advanced Authentication

### Token Rotation Flow

```
┌─────────────────────────────────────────────────────────┐
│ User Login                                              │
│ ↓                                                       │
│ Generate Access Token (15 min) + Refresh Token (7 d)  │
│ ↓                                                       │
│ Store Refresh Token in DB with security metadata       │
│ ↓                                                       │
│ Set httpOnly Cookies (XSS protection)                 │
│ ↓                                                       │
│ Response with user data                                │
└─────────────────────────────────────────────────────────┘

On Access Token Expiry:
→ Client sends request
→ If 401 received, call /api/auth/refresh
→ Uses httpOnly refreshToken cookie
→ Receives new access token
→ Automatically sets new cookie
→ Retries original request
```

### Authentication Endpoints

```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

# Refresh Token
POST /api/auth/refresh
Cookie: refreshToken=...

# Get Profile
GET /api/auth/profile
Authorization: Bearer <access_token>

# Logout (revokes current token)
POST /api/auth/logout
Authorization: Bearer <access_token>
```

## 🧪 Testing

### Run Tests

```bash
cd server

# Run all tests with coverage
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Run specific test
npm test auth.test.js

# View coverage report
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Test Coverage

- **Auth Tests**: Registration, login, refresh, logout, roles (24 tests)
- **Ranking Tests**: ELO, leaderboard, comparisons (10 tests)
- **Quiz Tests**: Room creation, AI generation, rate limiting (8 tests)
- **Game State Tests**: Timer sync, submissions, reconnect (6 tests)
- **Total**: 48+ comprehensive test cases

### Example Test

```javascript
describe('Authentication', () => {
  it('should register user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('player');
    expect(response.headers['set-cookie']).toContainEqual(
      expect.stringContaining('accessToken')
    );
  });
});
```

## 🔒 Security Features

### Authentication & Authorization
- ✅ **JWT Tokens**: Short-lived (15 min) + long-lived refresh (7 days)
- ✅ **HttpOnly Cookies**: XSS protection, httpOnly + secure + sameSite flags
- ✅ **Role-Based Access**: Admin and player roles with middleware
- ✅ **Password Security**: bcrypt with 10 salt rounds
- ✅ **Token Revocation**: Refresh tokens tracked and revocable

### Rate Limiting
- ✅ **General API**: 100 requests per 15 minutes per IP
- ✅ **Auth Endpoints**: 5 attempts per 15 minutes per IP
- ✅ **Socket.io Events**: 60 events per minute per socket
- ✅ **AI Endpoint**: 10 generations per hour per user
- ✅ **Distributed**: Redis-backed for multi-server

### Game Security
- ✅ **Server-Side Locks**: Prevent double submissions
- ✅ **Timer Sync**: Server timestamp prevents cheating
- ✅ **Answer Validation**: Server-side time verification
- ✅ **IP Tracking**: Monitor suspicious activity

### Data Protection
- ✅ **Input Validation**: All fields validated
- ✅ **Error Handling**: No sensitive data in responses
- ✅ **CORS**: Configured for specific origins
- ✅ **Logging**: Security events logged with Winston

## 📈 Scalability

### Horizontal Scaling Architecture

```
┌─────────────────────────────────────────────┐
│ Client Layer (Load Balanced)                │
│ Multiple React Instances                    │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
    │Server1│   │Server2│   │ServerN│
    │Express│   │Express│   │Express│
    └───┬───┘   └───┬───┘   └───┬───┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────▼──────────┐
        │  Redis Cluster       │
        │  - Cache Layer       │
        │  - Pub/Sub Broker    │
        │  - Rate Limit Store  │
        │  - Session Store     │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │  MongoDB Replica Set │
        │  - Primary           │
        │  - Secondaries       │
        └──────────────────────┘
```

### Scalability Features

1. **Stateless Design**
   - All state in Redis/MongoDB
   - No local session storage
   - Any server handles any request

2. **Redis Adapter for Socket.io**
   - Connects multiple servers
   - Cross-server room broadcasting
   - Scales to unlimited concurrent connections

3. **Database Optimization**
   - MongoDB indexes on frequently queried fields
   - Connection pooling
   - Query optimization

4. **Caching Strategy**
   - AI questions: 24-hour TTL
   - Game state: 30-minute TTL
   - Leaderboard: 5-minute TTL

5. **Load Balancing**
   - Sticky sessions for WebSocket
   - Health check at `/api/health`
   - Nginx or AWS ELB recommended

### Performance Targets

- **Response Time**: < 100ms (p99)
- **Throughput**: 1000+ concurrent connections
- **Message Latency**: < 50ms (WebSocket)
- **Uptime**: 99.9% availability

## 🚀 Deployment
```

## 🎨 UI Features

- **Dark/Light theme** - Smooth transitions
- **Responsive design** - Works on mobile, tablet, desktop
- **Smooth animations** - Modern visual feedback
- **Real-time updates** - Instant leaderboard changes
- **Progress indicators** - Question timer and progress bar
- **User-friendly interface** - Intuitive navigation

## 🔒 Future Enhancements

- 🔐 User authentication with JWT
- 🎵 Sound effects for answers
- 🏅 User profiles and statistics
- 🤖 AI-generated questions
- 💾 Quiz history and replays
- 📱 Mobile app
- 🌙 Dark/Light theme toggle
- 🌍 Internationalization (i18n)

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created as a full-stack MERN learning project.

---

**Happy Quizzing! 🎯**
