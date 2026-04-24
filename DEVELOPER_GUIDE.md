# 📖 Developer Guide

## Code Structure & Best Practices

### Backend Structure

#### Models (`server/models/*.js`)
- Define MongoDB schemas
- Add validation rules
- Create helper methods if needed

```javascript
// Example: Adding validation
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username required'],
    unique: true
  }
});
```

#### Controllers (`server/controllers/*.js`)
- Contain business logic
- Handle REST endpoints
- Validate inputs
- Call database

```javascript
// Pattern: Validate, Execute, Respond
export const createRoom = async (req, res) => {
  try {
    const { roomName, username } = req.body;
    
    // Validate
    if (!roomName) return res.status(400).json({...});
    
    // Create
    const room = new Room({...});
    await room.save();
    
    // Respond
    res.status(201).json({...});
  } catch (error) {
    res.status(500).json({...});
  }
};
```

#### Routes (`server/routes/*.js`)
- Define API endpoints
- Map to controllers
- Keep routes simple

```javascript
// Pattern: HTTP method + path + controller
router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);
```

#### Socket Handlers (`server/sockets/socketHandler.js`)
- Real-time event handlers
- Broadcast to specific rooms
- Handle game logic

```javascript
// Pattern: socket.on -> process -> io.to(room).emit()
socket.on('submitAnswer', async (data) => {
  // Process answer
  // Calculate score
  // Broadcast result
  io.to(roomId).emit('leaderboardUpdate', {...});
});
```

### Frontend Structure

#### Components (`client/src/components/*.js`)
- Reusable UI elements
- Accept props for configuration
- Keep focused and single-responsibility

```javascript
// Pattern: Props-based, no state when possible
const QuestionCard = ({ question, options, timer }) => {
  return <div>...</div>;
};
```

#### Pages (`client/src/pages/*.js`)
- Full page views
- Can manage local state
- Use Quiz context for global state

```javascript
// Pattern: Use context, manage page-level state
const Quiz = ({ setActiveTab }) => {
  const { currentQuestion, submitAnswerFunc } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  return <div>...</div>;
};
```

#### Context (`client/src/context/QuizContext.js`)
- Global state management
- Socket connection setup
- Shared functions

```javascript
// Pattern: Provider component + hook
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('Must use within QuzProvider');
  return context;
};
```

## Adding New Features

### Add a New Question Category

1. **Update server model:**
   ```javascript
   // server/models/Question.js
   category: {
     type: String,
     enum: ['Tech', 'Sports', 'Movies', 'General', 'YOUR_NEW_CATEGORY'],
     default: 'General'
   }
   ```

2. **Add seed data:**
   ```javascript
   // server/routes/questionRoutes.js
   {
     question: 'Sample',
     options: [...],
     correctAnswer: 0,
     category: 'YOUR_NEW_CATEGORY'
   }
   ```

3. **Update frontend:**
   ```javascript
   // client/src/pages/Dashboard.js
   <option value="YOUR_NEW_CATEGORY">🎯 New Category</option>
   ```

### Add a New Page

1. **Create component:**
   ```javascript
   // client/src/pages/NewPage.js
   const NewPage = ({ setActiveTab }) => {
     const { /* context hooks */ } = useQuiz();
     return <div>...</div>;
   };
   export default NewPage;
   ```

2. **Add to App:**
   ```javascript
   // client/src/App.js
   {activeTab === 'newpage' && <NewPage setActiveTab={setActiveTab} />}
   ```

3. **Add to Sidebar:**
   ```javascript
   // Add navigation item
   { id: 'newpage', label: 'New Page', icon: '🎨' }
   ```

### Add a New Socket Event

1. **Client emit:**
   ```javascript
   // In any page/component
   socket.emit('myNewEvent', { data: 'value' });
   ```

2. **Server listener:**
   ```javascript
   // server/sockets/socketHandler.js
   socket.on('myNewEvent', async (data) => {
     // Process
     io.to(roomId).emit('responseEvent', { result });
   });
   ```

3. **Client listener:**
   ```javascript
   // client/src/context/QuizContext.js
   socket.on('responseEvent', (data) => {
     setMyState(data.result);
   });
   ```

## Testing Guide

### Test Socket Events

1. **Verify connection:**
   ```javascript
   // Browser console
   socket.connected // Should be true
   socket.id // Should show socket ID
   ```

2. **Test event emission:**
   ```javascript
   // Browser console
   socket.emit('testEvent', { test: 'data' });
   
   // Backend should log event
   ```

### Test APIs

```bash
# Using curl
curl -X POST http://localhost:5000/api/rooms/create-room \
  -H "Content-Type: application/json" \
  -d '{"roomName":"Test","username":"Player1"}'

# Using Postman
# Create new POST request to http://localhost:5000/api/rooms/create-room
# Add JSON body and send
```

### Test Database

```bash
# Connect to MongoDB
mongosh

# Select database
use quiz-battle

# Check collections
show collections

# View data
db.users.find().pretty()
db.rooms.find().pretty()
db.questions.find().pretty()

# Count documents
db.questions.countDocuments()

# Delete test data
db.rooms.deleteMany({ roomName: "Test" })
```

## Debugging Tips

### Backend Debugging

```javascript
// Add console logs strategically
console.log('joinRoom data:', data);
console.log('room object:', room);
console.error('error with details:', error.message);

// Use different log levels
console.log('ℹ️ Info')
console.error('❌ Error')
console.warn('⚠️ Warning')
console.log('✅ Success')
```

### Frontend Debugging

```javascript
// Browser DevTools
// Open F12 → Console tab
console.log('component mounted');
console.log('context state:', useQuiz());

// Check Socket events
// In browser console:
socket.onAny((event, ...args) => {
  console.log(event, args);
});
```

### Network Debugging

```javascript
// Chrome DevTools → Network tab
// See all API calls and responses

// WebSocket debugging
// Network tab filters "WS" (WebSocket)
// See all socket events
```

## Performance Optimization

### Database
```javascript
// Add indexes for frequently queried fields
userSchema.index({ username: 1 });
questionSchema.index({ category: 1 });
roomSchema.index({ roomId: 1 });
```

### Socket.io
```javascript
// Use rooms to broadcast efficiently
io.to(roomId).emit(...); // Only to room
socket.emit(...);        // Only to sender
io.emit(...);            // Everyone (avoid!)
```

### React
```javascript
// Use React.memo for expensive components
const LeaderboardItem = React.memo(({ player }) => {
  return <div>{player.username}</div>;
});

// Use Keys in lists
{leaderboard.map((player, index) => (
  <div key={player.username + index}>...</div>
))}
```

## Code Style

### Backend (Node.js)
- Use async/await (not callbacks)
- Consistent error handling
- Meaningful variable names
- Comments for complex logic

### Frontend (React)
- Use functional components
- Use hooks for state
- Extract reusable logic
- Props-based configuration

## Deployment Checklist

- [ ] Remove console.logs
- [ ] Update API endpoint to production
- [ ] Set up environment variables
- [ ] Test all features
- [ ] Check responsive design
- [ ] Optimize images
- [ ] Security review
- [ ] Database backups

---

**Happy Coding! 🚀**
