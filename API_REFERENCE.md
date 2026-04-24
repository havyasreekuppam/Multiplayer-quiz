# 📖 API Reference

Complete API documentation for the Quiz Battle backend.

**Base URL:** `http://localhost:5000/api`
**Auth Header:** `Authorization: Bearer {token}`

---

## 🔐 Authentication (NEW)

### Register New User

```
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "success": true,
  "message": "✅ User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "🎮"
  }
}
```

**Errors:**
- 400: Username/Email already exists
- 400: Passwords do not match
- 400: Password too short (< 6 chars)
- 400: Invalid email format

---

### Login User

```
POST /auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "✅ Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "🎮",
    "score": 500,
    "totalGames": 10,
    "wins": 5
  }
}
```

**Errors:**
- 400: Invalid credentials
- 400: Email required
- 400: Password required

---

### Get User Profile ⭐ (Protected)

```
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "email": "player1@example.com",
    "avatar": "🎮",
    "score": 500,
    "totalGames": 10,
    "wins": 5,
    "averageScore": 50,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- 401: No token provided
- 401: Invalid token
- 404: User not found

---

### Update User Profile ⭐ (Protected)

```
PUT /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "username": "NewUsername",
  "avatar": "🎯"
}

Response (200):
{
  "success": true,
  "message": "✅ Profile updated",
  "user": { ... updated user data ... }
}
```

---

### Logout ⭐ (Protected)

```
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "success": true,
  "message": "✅ Logged out successfully"
}
```

---

## 🎮 Rooms (Existing)

### Create Quiz Room

```
POST /rooms/create
Content-Type: application/json

{
  "roomName": "Tech Quiz Battle",
  "username": "player1",
  "category": "Tech"
}

Response (201):
{
  "success": true,
  "room": {
    "roomId": "room_abc123",
    "roomName": "Tech Quiz Battle",
    "admin": "player1",
    "category": "Tech",
    "players": [...],
    "status": "WAITING"
  }
}
```

---

### Get Room Details

```
GET /rooms/:roomId

Response (200):
{
  "success": true,
  "room": { ... room data ... }
}
```

---

### List All Rooms

```
GET /rooms
Query: ?status=WAITING&category=Tech

Response (200):
{
  "success": true,
  "count": 5,
  "rooms": [...]
}
```

---

## ❓ Questions

### Get All Questions

```
GET /questions/all

Response (200):
{
  "success": true,
  "count": 14,
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "question": "What does HTML stand for?",
      "options": [
        "Hyper Text Markup Language",
        "High Tech Markup Language",
        "Home Tool Markup Language",
        "Hyperlinks Text Markup Language"
      ],
      "correctAnswer": 0,
      "category": "Tech",
      "difficulty": "Easy"
    },
    ...
  ]
}
```

---

### Generate Questions (NEW)

```
POST /questions/generate
Content-Type: application/json

{
  "category": "Tech",
  "count": 5
}

Response (201):
{
  "success": true,
  "message": "✅ Questions generated successfully",
  "count": 5,
  "questions": [
    {
      "category": "Tech",
      "question": "What does API stand for?",
      "options": ["App Program Interface", "Application Programming Interface", "..."],
      "correct": 1,
      "difficulty": "medium",
      "timeLimit": 15
    },
    ...
  ],
  "note": "Mock data - integrate with OpenAI API for production"
}
```

**Parameters:**
- `category`: "Tech" | "Sports" | "Movies" | "General"
- `count`: 1-20 questions

---

## 🏆 Matches / Game History (NEW)

### Create Match Record

```
POST /matches/create
Content-Type: application/json

{
  "roomId": "room_abc123",
  "roomName": "Tech Quiz Battle",
  "category": "Tech",
  "players": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "username": "player1",
      "finalScore": 85,
      "answers": [0, 1, 2, 1, 0],
      "correctAnswers": 4
    },
    {
      "userId": "507f1f77bcf86cd799439012",
      "username": "player2",
      "finalScore": 70,
      "answers": [0, 0, 2, 1, 1],
      "correctAnswers": 3
    }
  ],
  "winner": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "player1",
    "finalScore": 85
  },
  "questions": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "duration": 120
}

Response (201):
{
  "success": true,
  "message": "✅ Match recorded",
  "match": {
    "id": "507f1f77bcf86cd799439015",
    "roomId": "room_abc123",
    "winner": { ... },
    "players": [ ... ],
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Get User Matches

```
GET /matches/user/{userId}?limit=10&skip=0
Authorization: Bearer {token} (optional)

Response (200):
{
  "success": true,
  "count": 5,
  "total": 5,
  "matches": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "roomId": "room_abc123",
      "roomName": "Tech Quiz Battle",
      "category": "Tech",
      "players": [
        {
          "userId": "507f1f77bcf86cd799439011",
          "username": "player1",
          "finalScore": 85,
          "correctAnswers": 4
        }
      ],
      "winner": { "username": "player1", "finalScore": 85 },
      "duration": 120,
      "totalQuestions": 5,
      "endedAt": "2024-01-15T10:35:00Z",
      "userScore": 85,
      "isWinner": true
    },
    ...
  ]
}
```

**Query Parameters:**
- `limit`: Number of results (default: 10, max: 50)
- `skip`: Number to skip (default: 0, for pagination)

---

### Get Match Details

```
GET /matches/{matchId}

Response (200):
{
  "success": true,
  "match": {
    "_id": "507f1f77bcf86cd799439015",
    "roomId": "room_abc123",
    "players": [ ... ],
    "questions": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "question": "What does HTML stand for?",
        "options": [ ... ],
        "correctAnswer": 0
      }
    ],
    ... full match data ...
  }
}
```

**Errors:**
- 404: Match not found

---

### Get User Statistics (NEW)

```
GET /matches/stats/{userId}

Response (200):
{
  "success": true,
  "stats": {
    "username": "player1",
    "totalGames": 10,
    "wins": 6,
    "winRate": 60,
    "totalScore": 750,
    "averageScore": 75,
    "bestScore": 95,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Global Leaderboard (NEW)

```
GET /matches/global/leaderboard?limit=10

Response (200):
{
  "success": true,
  "count": 10,
  "leaderboard": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "player1",
      "avatar": "🎮",
      "score": 750,
      "totalGames": 10,
      "wins": 6,
      "averageScore": 75
    },
    ...
  ]
}
```

**Query Parameters:**
- `limit`: Top N players (default: 10)

---

## 📊 Real-Time Events (Socket.io)

### Room Events

```javascript
// User joins room
socket.emit('joinRoom', { roomId, username })
socket.on('playerJoined', { player, totalPlayers })

// Quiz starts
socket.emit('startQuiz', { roomId })
socket.on('quizStarted', { questions, timeLimit })

// Submit answer
socket.emit('submitAnswer', { roomId, answer, timeInSeconds })
socket.on('answerSubmitted', { success, isCorrect })

// Next question
socket.on('nextQuestion', { question, number, totalQuestions })

// Quiz ends
socket.on('quizEnded', { 
  leaderboard,
  yourScore,
  winner,
  duration
})

// User leaves
socket.emit('leaveRoom', { roomId })
socket.on('playerLeft', { player })
```

---

## ⚠️ Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid parameter format |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate username/email |
| 500 | Server Error | Backend error |

---

## 🔑 Authentication

### Token Format

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "507f1f77bcf86cd799439011",
  "email": "player1@example.com",
  "iat": 1705325400,
  "exp": 1705930200
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Token Storage

```javascript
// Frontend
localStorage.setItem('token', tokenFromServer);

// On subsequent requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Token Expiration

- Default: 7 days
- Auto-refresh: Not implemented (user must re-login)
- Revocation: Clear localStorage

---

## 🧪 Example Requests

### Register & Login Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testplayer",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Response includes token
# Save token for next requests

# 2. Login with same credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Get profile (using token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGc..."

# 4. Generate questions
curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Tech",
    "count": 5
  }'

# 5. Save match result
curl -X POST http://localhost:5000/api/matches/create \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room_xyz",
    "roomName": "Quiz Battle",
    "category": "Tech",
    "players": [
      {
        "userId": "user_id",
        "username": "player1",
        "finalScore": 85,
        "answers": [0, 1, 2, 1, 0],
        "correctAnswers": 4
      }
    ],
    "winner": {
      "userId": "user_id",
      "username": "player1",
      "finalScore": 85
    },
    "duration": 120
  }'

# 6. Get user stats
curl -X GET http://localhost:5000/api/matches/stats/user_id
```

---

## 📱 Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "✅ Action completed",
  "data": { /* ... response data ... */ }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "❌ Error description",
  "error": "Detailed error message"
}
```

---

## 🔗 Related Resources

- [Backend Setup](./QUICK_START.md)
- [Authentication Guide](./PRODUCTION_FEATURES_GUIDE.md#1-authentication-system)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Full Documentation](./README.md)

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
