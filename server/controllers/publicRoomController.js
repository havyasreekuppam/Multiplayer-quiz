import Room from '../models/Room.js';

/**
 * Public Room Controller
 * Manages public quiz rooms and host controls
 */

export const createPublicRoom = async (req, res) => {
  try {
    const { roomName, category, username, userId, isRanked = false } = req.body;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: '❌ Room name required',
      });
    }

    // Create public room
    const room = new Room({
      roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomName,
      category,
      admin: username,
      adminId: userId,
      players: [{ username, userId }],
      status: 'WAITING',
      isPublic: true,
      isRanked,
      maxPlayers: 8,
      hostControls: {
        canKick: true,
        canPause: true,
        canRestart: true,
      },
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: '✅ Public room created',
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        admin: room.admin,
        players: room.players,
        isPublic: true,
        isRanked,
      },
    });
  } catch (error) {
    console.error('Error creating public room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message,
    });
  }
};

/**
 * List public rooms (browsable)
 */
export const getPublicRooms = async (req, res) => {
  try {
    const { category, isRanked, limit = 20, page = 1 } = req.query;

    const filter = { isPublic: true, status: 'WAITING' };

    if (category) filter.category = category;
    if (isRanked !== undefined) filter.isRanked = isRanked === 'true';

    const skip = (page - 1) * limit;

    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      success: true,
      rooms: rooms.map((room) => ({
        roomId: room.roomId,
        roomName: room.roomName,
        category: room.category,
        admin: room.admin,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        isRanked: room.isRanked,
        createdAt: room.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching public rooms',
      error: error.message,
    });
  }
};

/**
 * Host control: Kick player from room
 */
export const kickPlayer = async (req, res) => {
  try {
    const { roomId, playerId, adminId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '❌ Room not found',
      });
    }

    // Verify admin
    if (room.adminId.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: '❌ Only room admin can kick players',
      });
    }

    // Remove player
    room.players = room.players.filter(
      (p) => p.userId.toString() !== playerId
    );

    await room.save();

    res.status(200).json({
      success: true,
      message: '✅ Player kicked from room',
      remainingPlayers: room.players.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error kicking player',
      error: error.message,
    });
  }
};

/**
 * Host control: Pause quiz
 */
export const pauseQuiz = async (req, res) => {
  try {
    const { roomId, adminId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '❌ Room not found',
      });
    }

    // Verify admin
    if (room.adminId.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: '❌ Only room admin can pause quiz',
      });
    }

    room.status = 'PAUSED';
    await room.save();

    res.status(200).json({
      success: true,
      message: '✅ Quiz paused',
      roomStatus: room.status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pausing quiz',
      error: error.message,
    });
  }
};

/**
 * Host control: Resume quiz
 */
export const resumeQuiz = async (req, res) => {
  try {
    const { roomId, adminId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '❌ Room not found',
      });
    }

    // Verify admin
    if (room.adminId.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: '❌ Only room admin can resume quiz',
      });
    }

    room.status = 'ACTIVE';
    await room.save();

    res.status(200).json({
      success: true,
      message: '✅ Quiz resumed',
      roomStatus: room.status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resuming quiz',
      error: error.message,
    });
  }
};

export default {
  createPublicRoom,
  getPublicRooms,
  kickPlayer,
  pauseQuiz,
  resumeQuiz,
};
