import Match from '../models/Match.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Match Controller - Handles game history
 * Stores completed matches and retrieves statistics
 */

const resolveUserFromIdentifier = async (identifier) => {
  if (!identifier) {
    return null;
  }

  if (typeof identifier === 'string' && identifier.includes('@')) {
    return User.findOne({ email: identifier.toLowerCase() });
  }

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) {
      return byId;
    }
  }

  return User.findOne({
    $or: [{ username: identifier }, { email: identifier.toLowerCase?.() }],
  });
};

export const createMatch = async (req, res) => {
  try {
    const { roomId, roomName, category, players, winner, questions, duration } = req.body;

    if (!roomId || !players || !winner) {
      return res.status(400).json({
        success: false,
        message: '❌ Missing required fields',
      });
    }

    const existingMatch = await Match.findOne({ roomId, status: 'COMPLETED' }).sort({ createdAt: -1 });
    if (existingMatch) {
      return res.status(200).json({
        success: true,
        message: '✅ Match already recorded',
        match: {
          id: existingMatch._id,
          roomId: existingMatch.roomId,
          winner: existingMatch.winner,
          players: existingMatch.players,
          createdAt: existingMatch.createdAt,
        },
      });
    }

    // Create match record
    const match = new Match({
      roomId,
      roomName,
      category,
      players,
      winner,
      questions,
      duration,
      totalQuestions: questions?.length || 0,
      status: 'COMPLETED',
    });

    await match.save();

    // Update user statistics
    for (const player of players) {
      const user = await User.findById(player.userId);
      if (user) {
        user.totalGames += 1;
        user.score += player.finalScore;

        // Update average score
        user.averageScore = Math.round(user.score / user.totalGames);

        // Check if winner
        if (winner.userId.toString() === player.userId.toString()) {
          user.wins += 1;
        }

        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      message: '✅ Match recorded',
      match: {
        id: match._id,
        roomId: match.roomId,
        winner: match.winner,
        players: match.players,
        createdAt: match.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Create Match Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error saving match',
      error: error.message,
    });
  }
};

export const getUserMatches = async (req, res) => {
  try {
    const { userId: userIdentifier } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    const user = await resolveUserFromIdentifier(userIdentifier);

    if (!user) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        matches: [],
      });
    }

    const userId = user._id.toString();

    // Find all matches where user participated
    const matches = await Match.find(
      { 'players.userId': userId },
      {
        roomId: 1,
        roomName: 1,
        category: 1,
        players: 1,
        winner: 1,
        duration: 1,
        totalQuestions: 1,
        endedAt: 1,
      }
    )
      .sort({ endedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Match.countDocuments({ 'players.userId': userId });

    // Add user's position in each match
    const enrichedMatches = matches.map((match) => {
      const userPlayer = match.players.find((p) => p.userId.toString() === userId);
      return {
        ...match.toObject(),
        userScore: userPlayer?.finalScore || 0,
        isWinner: match.winner.userId.toString() === userId,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedMatches.length,
      total,
      matches: enrichedMatches,
    });
  } catch (error) {
    console.error('❌ Get Matches Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message,
    });
  }
};

export const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate('questions');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: '❌ Match not found',
      });
    }

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching match details',
      error: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { userId: userIdentifier } = req.params;

    const user = await resolveUserFromIdentifier(userIdentifier);
    if (!user) {
      return res.status(200).json({
        success: true,
        stats: {
          username: 'Player',
          totalGames: 0,
          wins: 0,
          winRate: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          createdAt: null,
        },
      });
    }

    const userId = user._id.toString();

    // Get all matches for user
    const matches = await Match.find({ 'players.userId': userId });

    // Calculate statistics
    const totalMatches = matches.length;
    const wins = matches.filter(
      (m) => m.winner.userId.toString() === userId
    ).length;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;

    // Get best score
    const bestScore =
      matches.length > 0
        ? Math.max(
            ...matches.map(
              (m) => m.players.find((p) => p.userId.toString() === userId)?.finalScore || 0
            )
          )
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        username: user.username,
        totalGames: user.totalGames,
        wins: user.wins,
        winRate: parseFloat(winRate),
        totalScore: user.score,
        averageScore: user.averageScore,
        bestScore: bestScore || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find()
      .select('username avatar score totalGames wins averageScore')
      .sort({ wins: -1, score: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};
