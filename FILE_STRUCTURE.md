# 📋 Project File Structure & Description

## Root Level Files
```
Multiplayer/
├── 📄 README.md              ← Start here! Main documentation
├── 📄 QUICK_START.md         ← Fast setup guide  
├── 📄 SETUP.md               ← Detailed setup instructions
├── 📄 ARCHITECTURE.md        ← System design & data flow
├── 📄 DEVELOPER_GUIDE.md     ← Code structure & best practices
├── 📄 .gitignore             ← Git ignore patterns
└── 📄 setup.sh               ← Auto-setup script (macOS/Linux)
```

## Backend (`server/`)
```
server/
├── 📄 server.js              ← Main Express server (PORT 5000)
├── 📄 package.json           ← Backend dependencies
├── 📄 .env                   ← Environment config
├── 📄 .env.example           ← Example env
├── 📄 .gitignore             ← Git patterns
│
├── 📁 config/
│   └── 📄 db.js              ← MongoDB connection setup
│
├── 📁 models/
│   ├── 📄 User.js            ← User schema
│   ├── 📄 Question.js        ← Question schema
│   └── 📄 Room.js            ← Room schema
│
├── 📁 routes/
│   ├── 📄 roomRoutes.js      ← Room APIs
│   └── 📄 questionRoutes.js  ← Question APIs & seeding
│
├── 📁 controllers/
│   └── 📄 roomController.js  ← Room business logic
│
└── 📁 sockets/
    └── 📄 socketHandler.js   ← Real-time event handlers
```

### Backend API Endpoints
```
Room Management:
  POST   /api/rooms/create-room         ← Create quiz room
  POST   /api/rooms/join-room           ← Join room
  GET    /api/rooms/room/:roomId        ← Get room details
  GET    /api/rooms/leaderboard/:roomId ← Get leaderboard

Questions:
  GET    /api/questions/:category       ← Get questions by category
  POST   /api/rooms/submit-answer       ← Submit answer

Health:
  GET    /api/health                    ← Server status
```

## Frontend (`client/`)
```
client/
├── 📄 package.json           ← Frontend dependencies
├── 📄 tailwind.config.js     ← Tailwind CSS config
├── 📄 postcss.config.js      ← PostCSS config
├── 📄 tsconfig.json          ← TypeScript config (optional)
├── 📄 .gitignore             ← Git patterns
├── 📄 .env.local             ← Frontend config
│
├── 📁 public/
│   └── 📄 index.html         ← HTML entry point
│
└── 📁 src/
    ├── 📄 index.js           ← React entry point
    ├── 📄 index.css          ← Global styles (Tailwind)
    ├── 📄 App.js             ← Main App component
    │
    ├── 📁 context/
    │   └── 📄 QuizContext.js ← Global state & Socket setup
    │
    ├── 📁 components/
    │   ├── 📄 Sidebar.js     ← Navigation sidebar
    │   ├── 📄 QuestionCard.js  ← Question display card
    │   ├── 📄 Leaderboard.js   ← Leaderboard component
    │   └── 📄 RoomInfoCard.js  ← Room details card
    │
    ├── 📁 pages/
    │   ├── 📄 Dashboard.js       ← Home/Create/Join room
    │   ├── 📄 WaitingRoom.js     ← Waiting & players list
    │   ├── 📄 Quiz.js           ← Active quiz gameplay
    │   └── 📄 LeaderboardPage.js ← Final results screen
    │
    └── 📁 hooks/
        └── (Custom hooks placeholder)
```

### Frontend Pages
```
App Routes:
  /               → Login screen
  Dashboard       → Create/Join rooms
  WaitingRoom     → Wait for quiz to start
  Quiz            → Playing the quiz
  Leaderboard     → Final results
```

## File Descriptions

### Backend Files

#### `server/server.js`
- Initializes Express app
- Connects MongoDB
- Sets up Socket.io
- Starts HTTP server on port 5000

#### `server/config/db.js`
- MongoDB connection
- Connection error handling
- Database selection

#### `server/models/User.js`
- Stores player profiles
- Username (unique)
- Score, wins, total games

#### `server/models/Question.js`
- Quiz questions
- Multiple choice options (4 options)
- Correct answer index
- Category & difficulty

#### `server/models/Room.js`
- Active quiz rooms
- Room code (6-char unique ID)
- Admin user
- Players list with scores
- Quiz status
- Current question index

#### `server/controllers/roomController.js`
- createRoom - Create new quiz room
- joinRoom - Add player to room
- getQuestionsByCategory - Fetch questions
- getRoomDetails - Get room info
- submitAnswer - Store player answer
- updateLeaderboard - Get rankings

#### `server/routes/roomRoutes.js`
- POST /create-room → createRoom
- POST /join-room → joinRoom
- GET /room/:roomId → getRoomDetails
- GET /questions/:category → getQuestionsByCategory
- POST /submit-answer → submitAnswer
- GET /leaderboard/:roomId → updateLeaderboard

#### `server/routes/questionRoutes.js`
- GET /all → Get all questions
- seedQuestions() → Auto-populate questions

#### `server/sockets/socketHandler.js`
- setupSocketEvents(io) - Main socket setup
- joinRoom - Connect to room
- startQuiz - Begin quiz (admin)
- submitAnswer - Process answer
- nextQuestion - Load next question
- leaveRoom - Disconnect player

### Frontend Files

#### `client/src/App.js`
- Main component
- Login screen
- Tab routing
- User authentication

#### `client/src/context/QuizContext.js`
- QuizProvider - Global provider
- useQuiz() - Custom hook
- Socket initialization
- Global state
- API calls & socket events

#### `client/src/components/Sidebar.js`
- Navigation menu
- User info display
- Logout button
- Mobile responsive

#### `client/src/components/QuestionCard.js`
- Display question
- Show options
- Display timer
- Progress indicator

#### `client/src/components/Leaderboard.js`
- Player rankings
- Medal icons (1st/2nd/3rd)
- Score display
- Sorted by score

#### `client/src/components/RoomInfoCard.js`
- Room code (copyable)
- Players list
- Room name & category
- Admin badge

#### `client/src/pages/Dashboard.js`
- Login state
- Create room form
- Join room form
- Room settings selection

#### `client/src/pages/WaitingRoom.js`
- Players waiting list
- Room details
- Start button (admin only)
- Leave button

#### `client/src/pages/Quiz.js`
- Current question display
- Answer submission
- Timer
- Live leaderboard sidebar

#### `client/src/pages/LeaderboardPage.js`
- Final rankings
- Winner display
- Statistics cards
- Action buttons

#### `client/src/index.css`
- Global Tailwind styles
- Custom animations
- Scrollbar styling

#### `client/public/index.html`
- HTML entry point
- Meta tags
- Root div for React

## Configuration Files

### Backend Configuration
- `.env` - Environment variables (PORT, MONGODB_URI, NODE_ENV)
- `.gitignore` - Files to exclude from git

### Frontend Configuration
- `.env.local` - React environment (REACT_APP_API_URL)
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS plugins
- `.gitignore` - Files to exclude from git

## Dependencies

### Backend (Node.js)
```json
{
  "express": "HTTP server",
  "mongoose": "MongoDB ODM",
  "socket.io": "Real-time communication",
  "cors": "Cross-origin resources",
  "dotenv": "Environment variables",
  "express-validator": "Input validation"
}
```

### Frontend (React)
```json
{
  "react": "UI framework",
  "react-dom": "React DOM rendering",
  "react-router-dom": "Routing (future use)",
  "socket.io-client": "Socket client",
  "lucide-react": "Icons",
  "axios": "HTTP client (future use)"
}
```

## Key File Relationships

```
server.js
├── connects to db.js
├── uses User, Question, Room models
├── registers roomRoutes & questionRoutes
├── registers socket handlers

App.js
├── wraps with QuizProvider
├── renders Sidebar
├── renders active page
├── pages use useQuiz() hook

Quiz.js
├── uses context (useQuiz)
├── displays QuestionCard
├── displays Leaderboard
├── emits socket events

QuizContext.js
├── initializes socket connection
├── calls API endpoints
├── manages all global state
└── provides hooks for components
```

---

**Total Files: 40+ JavaScript files + Configuration & Documentation**

**Ready to explore? Start with: `README.md` → `QUICK_START.md` → `SETUP.md`** 🚀
