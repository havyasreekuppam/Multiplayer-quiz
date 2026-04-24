import User from '../models/User.js';
import Question from '../models/Question.js';
import Room from '../models/Room.js';

// Generate a random room code (e.g., "ABC123")
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const buildFallbackEmail = (username) => {
  const safeUsername = (username || 'player').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${safeUsername || 'player'}@quizbattle.local`;
};

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { roomName, username, email, category, totalQuestions } = req.body;

    // Validate input
    if (!roomName || !username) {
      return res.status(400).json({ message: '❌ Room name and username required' });
    }

    // Find or create user
    const resolvedEmail = email || buildFallbackEmail(username);

    let user = await User.findOne({
      $or: [{ username }, ...(email ? [{ email }] : [])],
    });
    if (!user) {
      user = new User({
        username,
        email: resolvedEmail,
      });
      await user.save();
    } else if (!user.email) {
      user.email = resolvedEmail;
      await user.save();
    }

    // Generate unique room ID
    const roomId = generateRoomCode();

    // Create new room
    const room = new Room({
      roomId,
      roomName,
      admin: username,
      category: category || 'General',
      totalQuestions: totalQuestions || 5,
      players: [
        {
          userId: user._id.toString(),
          username,
          score: 0,
          answers: [],
          currentQuestionIndex: 0,
          totalTime: 0,
          isFinished: false,
        },
      ],
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: '✅ Room created successfully',
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        admin: room.admin,
        category: room.category,
        totalQuestions: room.totalQuestions,
        players: room.players,
      },
    });
  } catch (error) {
    console.error('❌ Create Room Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// JOIN ROOM
export const joinRoom = async (req, res) => {
  try {
    const { roomId, username, email } = req.body;

    if (!roomId || !username) {
      return res.status(400).json({ message: '❌ Room ID and username required' });
    }

    // Find room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: '❌ Room not found' });
    }

    // Check room status
    if (room.status === 'COMPLETED') {
      return res.status(400).json({ message: '❌ Room quiz already completed' });
    }

    // Check if player already in room
    const playerExists = room.players.some((p) => p.username === username);
    if (playerExists) {
      return res.status(400).json({ message: '⚠️ Player already in room' });
    }

    // Check max players
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ message: '❌ Room is full' });
    }

    // Find or create user
    const resolvedEmail = email || buildFallbackEmail(username);

    let user = await User.findOne({
      $or: [{ username }, ...(email ? [{ email }] : [])],
    });
    if (!user) {
      user = new User({
        username,
        email: resolvedEmail,
      });
      await user.save();
    } else if (!user.email) {
      user.email = resolvedEmail;
      await user.save();
    }

    // Add player to room
    room.players.push({
      userId: user._id.toString(),
      username,
      score: 0,
      answers: [],
      currentQuestionIndex: 0,
      totalTime: 0,
      isFinished: false,
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: '✅ Joined room successfully',
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        admin: room.admin,
        category: room.category,
        totalQuestions: room.totalQuestions,
        players: room.players,
        status: room.status,
      },
    });
  } catch (error) {
    console.error('❌ Join Room Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET QUESTIONS BY CATEGORY
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const questions = await Question.find({ category }).limit(parseInt(limit));

    if (questions.length === 0) {
      return res.status(404).json({ message: '❌ No questions found for this category' });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('❌ Get Questions Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ROOM DETAILS
export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId }).populate('questions');
    if (!room) {
      return res.status(404).json({ message: '❌ Room not found' });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('❌ Get Room Details Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SUBMIT ANSWER
export const submitAnswer = async (req, res) => {
  try {
    const { roomId, username, questionIndex, selectedAnswer } = req.body;

    if (!roomId || !username || questionIndex === undefined || selectedAnswer === undefined) {
      return res.status(400).json({ message: '❌ Missing required fields' });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: '❌ Room not found' });
    }

    // Find player in room
    const playerIndex = room.players.findIndex((p) => p.username === username);
    if (playerIndex === -1) {
      return res.status(404).json({ message: '❌ Player not found in room' });
    }

    // Store answer
    if (!room.players[playerIndex].answers) {
      room.players[playerIndex].answers = [];
    }
    room.players[playerIndex].answers[questionIndex] = selectedAnswer;

    await room.save();

    res.status(200).json({
      success: true,
      message: '✅ Answer submitted',
    });
  } catch (error) {
    console.error('❌ Submit Answer Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE LEADERBOARD
export const updateLeaderboard = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: '❌ Room not found' });
    }

    // Sort players by score
    const leaderboard = room.players.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('❌ Update Leaderboard Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
