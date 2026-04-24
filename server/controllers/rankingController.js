import Ranking from '../models/Ranking.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import {
  calculateELOChange,
  calculateNewELO,
  getLevelFromELO,
  getLevelProgress,
  checkBadges,
} from '../utils/eloCalculator.js';

/**
 * Ranking Controller
 * Manages player rankings, ELO ratings, and levels
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

export const getRanking = async (req, res) => {
  try {
    const { userId: userIdentifier } = req.params;
    const user = await resolveUserFromIdentifier(userIdentifier);

    if (!user) {
      return res.status(200).json({
        success: true,
        ranking: {
          eloRating: 1000,
          level: 'Bronze',
          levelProgress: 0,
          totalRankedGames: 0,
          rankedWins: 0,
          winStreak: 0,
          bestWinStreak: 0,
          badges: [],
          user: null,
        },
      });
    }

    const userId = user._id.toString();
    let ranking = await Ranking.findOne({ userId });

    if (!ranking) {
      // Create initial ranking if doesn't exist
      ranking = await Ranking.create({
        userId,
        eloRating: 1000,
        level: 'Bronze',
        levelProgress: 0,
      });
    }

    res.status(200).json({
      success: true,
      ranking: {
        ...ranking.toObject(),
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ranking',
      error: error.message,
    });
  }
};

/**
 * Get global leaderboard
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const rankings = await Ranking.find()
      .sort({ eloRating: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('userId', 'username avatar email');

    const total = await Ranking.countDocuments();

    res.status(200).json({
      success: true,
      leaderboard: rankings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

/**
 * Update ranking after ranked match
 */
export const updateRankingAfterMatch = async (req, res) => {
  try {
    const { matchId, winnerId, loserId, winnerScore, loserScore } = req.body;

    // Get rankings
    let winnerRanking = await Ranking.findOne({ userId: winnerId });
    let loserRanking = await Ranking.findOne({ userId: loserId });

    // Create if doesn't exist
    if (!winnerRanking) {
      winnerRanking = await Ranking.create({
        userId: winnerId,
        eloRating: 1000,
      });
    }

    if (!loserRanking) {
      loserRanking = await Ranking.create({
        userId: loserId,
        eloRating: 1000,
      });
    }

    // Calculate ELO changes
    const winnerELOChange = calculateELOChange(
      winnerRanking.eloRating,
      loserRanking.eloRating,
      true
    );

    const loserELOChange = calculateELOChange(
      loserRanking.eloRating,
      winnerRanking.eloRating,
      false
    );

    // Update ELO ratings
    const newWinnerRating = calculateNewELO(
      winnerRanking.eloRating,
      winnerELOChange
    );
    const newLoserRating = calculateNewELO(
      loserRanking.eloRating,
      loserELOChange
    );

    // Get new levels
    const newWinnerLevel = getLevelFromELO(newWinnerRating);
    const newLoserLevel = getLevelFromELO(newLoserRating);

    // Update winner ranking
    winnerRanking.eloRating = newWinnerRating;
    winnerRanking.level = newWinnerLevel;
    winnerRanking.levelProgress = getLevelProgress(newWinnerRating);
    winnerRanking.totalRankedGames += 1;
    winnerRanking.rankedWins += 1;
    winnerRanking.winStreak += 1;

    if (winnerRanking.winStreak > winnerRanking.bestWinStreak) {
      winnerRanking.bestWinStreak = winnerRanking.winStreak;
    }

    winnerRanking.lastRankedMatch = new Date();

    // Get and add badges
    const winnerBadges = checkBadges(winnerRanking);
    winnerRanking.badges = winnerBadges;

    // Update loser ranking
    loserRanking.eloRating = newLoserRating;
    loserRanking.level = newLoserLevel;
    loserRanking.levelProgress = getLevelProgress(newLoserRating);
    loserRanking.totalRankedGames += 1;
    loserRanking.winStreak = 0; // Reset win streak on loss
    loserRanking.lastRankedMatch = new Date();

    // Get and add badges
    const loserBadges = checkBadges(loserRanking);
    loserRanking.badges = loserBadges;

    // Save both
    await winnerRanking.save();
    await loserRanking.save();

    res.status(200).json({
      success: true,
      message: '✅ Rankings updated',
      winner: {
        ranking: winnerRanking,
        eloChange: winnerELOChange,
      },
      loser: {
        ranking: loserRanking,
        eloChange: loserELOChange,
      },
    });
  } catch (error) {
    console.error('Error updating ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ranking',
      error: error.message,
    });
  }
};

/**
 * Get ranking comparison
 */
export const compareRankings = async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;

    const ranking1 = await Ranking.findOne({ userId: userId1 }).populate(
      'userId',
      'username avatar'
    );
    const ranking2 = await Ranking.findOne({ userId: userId2 }).populate(
      'userId',
      'username avatar'
    );

    if (!ranking1 || !ranking2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found',
      });
    }

    res.status(200).json({
      success: true,
      comparison: {
        player1: ranking1,
        player2: ranking2,
        eloTrend: ranking1.eloRating - ranking2.eloRating,
        levelDifference:
          ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].indexOf(
            ranking1.level
          ) -
          ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].indexOf(
            ranking2.level
          ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing rankings',
      error: error.message,
    });
  }
};
