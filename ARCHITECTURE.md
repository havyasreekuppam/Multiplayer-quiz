# 🎯 Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────┐
│              React Frontend (port 3000)              │
│  ┌──────────────────────────────────────────────┐  │
│  │ Pages:                                       │  │
│  │ - Dashboard (Create/Join Rooms)             │  │
│  │ - Waiting Room (Players & Admin Controls)   │  │
│  │ - Quiz (Questions & Answers)                │  │
│  │ - Leaderboard (Live Rankings)               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Components:                                  │  │
│  │ - Sidebar (Navigation)                      │  │
│  │ - QuestionCard (Question Display)           │  │
│  │ - Leaderboard (Rankings)                    │  │
│  │ - RoomInfoCard (Room Details)               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Context (State Management)                  │  │
│  │ - QuizContext (Global State)                │  │
│  │ - Socket.io Client Connection               │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │◄──────────► Socket.io ◄──────────►│
┌─────────────────────────────────────────────────────┐
│          Node.js + Express (port 5000)              │
│  ┌──────────────────────────────────────────────┐  │
│  │ REST API Endpoints:                          │  │
│  │ POST   /api/rooms/create-room               │  │
│  │ POST   /api/rooms/join-room                 │  │
│  │ GET    /api/rooms/room/:roomId              │  │
│  │ GET    /api/questions/:category             │  │
│  │ POST   /api/rooms/submit-answer             │  │
│  │ GET    /api/rooms/leaderboard/:roomId       │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Socket.io Event Handlers:                   │  │
│  │ joinRoom, startQuiz, submitAnswer           │  │
│  │ nextQuestion, leaveRoom, updateLeaderboard  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Controllers & Business Logic                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │◄──────────► Database ◄──────────►│
┌─────────────────────────────────────────────────────┐
│        MongoDB (Local or Atlas)                     │
│  Collections:                                       │
│  - users (Player profiles & stats)                 │
│  - questions (Quiz questions)                      │
│  - rooms (Active quiz sessions)                    │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Create Room Flow

```
User Input (Dashboard)
    ↓
createRoom() call
    ↓
POST /api/rooms/create-room
    ↓
Controller: Creates room & user in MongoDB
    ↓
Response with room details
    ↓
Socket: Emit joinRoom event
    ↓
SetActiveTab('waiting')
    ↓
Display: Waiting Room with players list
```

### 2. Join Room Flow

```
User Input (Room Code)
    ↓
joinRoomFunc() call
    ↓
POST /api/rooms/join-room
    ↓
Controller: Adds user to room in MongoDB
    ↓
Response with room details
    ↓
Socket: Emit joinRoom event
    ↓
Server broadcasts: userJoined to all players
    ↓
Update local state with new player list
    ↓
Display: Updated players in Waiting Room
```

### 3. Game Flow

```
Admin clicks "Start Quiz"
    ↓
Socket emit: startQuiz event
    ↓
Server: Fetches questions, updates room status
    ↓
Server broadcasts: quizStarted, nextQuestion
    ↓
Frontend displays: Question & Options
    ↓
Player selects answer & clicks submit
    ↓
Socket emit: submitAnswer
    ↓
Server: Calculates points, checks answer
    ↓
Server broadcasts: answerResult, leaderboardUpdate
    ↓
Frontend shows: Correct/Wrong feedback
    ↓
Admin clicks: Next Question
    ↓
Repeat for all questions
    ↓
After last question: Server broadcasts quizEnded
    ↓
Display: Final leaderboard with winner
```

## State Management

### Global State (QuizContext)

```javascript
{
  // Connection
  socket: Socket,
  
  // User Info
  username: String,
  isAdmin: Boolean,
  
  // Room Info
  roomId: String,
  roomName: String,
  category: String,
  totalQuestions: Number,
  players: Array,
  
  // Game State
  gameStatus: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED',
  currentQuestion: Object,
  questionIndex: Number,
  timer: Number,
  
  // User Current Answer
  userAnswer: Number,
  answerResult: Object,
  
  // Leaderboard
  leaderboard: Array,
  
  // UI State
  error: String,
  loading: Boolean
}
```

## Socket Events Mapping

### Client Emits
| Event | Payload | Purpose |
|-------|---------|---------|
| `joinRoom` | `{roomId, username}` | Join a quiz room |
| `startQuiz` | `{roomId, category}` | Start the quiz (admin) |
| `submitAnswer` | `{roomId, username, questionIndex, selectedAnswer, timeTaken}` | Submit answer |
| `nextQuestion` | `{roomId}` | Load next question (admin) |
| `leaveRoom` | `{roomId, username}` | Leave the room |

### Server Broadcasts
| Event | Data | Triggered | Purpose |
|-------|------|-----------|---------|
| `roomState` | Room details | On join | Send initial room state |
| `userJoined` | Player info | On join | Notify room members |
| `userLeft` | Player info | On leave | Notify member left |
| `quizStarted` | Quiz info | On start | Quiz has started |
| `nextQuestion` | Question data | On request | Display new question |
| `answerResult` | Result object | After submit | Feedback to player |
| `leaderboardUpdate` | Leaderboard array | After submit | Update rankings |
| `quizEnded` | Winner & scores | On completion | Show results |

## Component Hierarchy

```
App
├── Sidebar
│   ├── Navigation
│   ├── User Info
│   └── Logout Button
└── Main View (based on activeTab)
    ├── Dashboard
    │   ├── CreateRoom Form
    │   └── JoinRoom Form
    │
    ├── WaitingRoom
    │   ├── RoomInfoCard
    │   └── Action Panel
    │
    ├── Quiz
    │   ├── QuestionCard
    │   ├── Option Buttons
    │   └── Leaderboard (side)
    │
    └── LeaderboardPage
        ├── Leaderboard Component
        └── Action Buttons
```

## Database Schema Relationships

```
User (1) ─┐
          ├─ (Many) Room Players
          │
          └─ (Many) Scores

Question (1) ─┐
              ├─ (Many) Room Questions
              │
              └─ (Referenced in) Room.questions

Room (1) ─┐
          ├─ Contains (Many) Players
          │
          ├─ References (Many) Questions
          │
          └─ Stores (Many) Player Answers
```

## Performance Considerations

1. **Socket.io Optimization:**
   - Use rooms to broadcast only to relevant players
   - Limit update frequency to prevent flooding
   - Disconnect unused sockets

2. **Database Optimization:**
   - Index frequently queried fields
   - Limit question fetches with pagination
   - Archive completed rooms after some time

3. **Frontend Optimization:**
   - Lazy load components
   - Memoize expensive computations
   - Use React hooks efficiently

## Security Notes

- Add user authentication (JWT tokens)
- Validate all input on backend
- Implement rate limiting
- Sanitize question content
- Add room password protection
- Verify admin permissions on all admin operations

---

**Architecture designed for scalability and real-time performance!** 🚀
