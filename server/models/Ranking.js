import mongoose from 'mongoose';

/**
 * Ranking Schema - Stores ELO rating and player levels
 * Used for competitive ranking system
 */

const rankingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    eloRating: {
      type: Number,
      default: 1000, // Starting ELO rating
      min: 0,
    },
    level: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze',
    },
    levelProgress: {
      type: Number,
      default: 0, // 0-100 progress to next level
    },
    totalRankedGames: {
      type: Number,
      default: 0,
    },
    rankedWins: {
      type: Number,
      default: 0,
    },
    winStreak: {
      type: Number,
      default: 0,
    },
    bestWinStreak: {
      type: Number,
      default: 0,
    },
    lastRankedMatch: Date,
    badges: [
      {
        name: String,
        description: String,
        unlockedAt: Date,
      },
    ],
    seasonStats: {
      season: String, // e.g., "Season 1"
      eloRatingAtStart: Number,
      eloRatingAtEnd: Number,
      gamesPlayed: Number,
      seasonWins: Number,
    },
  },
  { timestamps: true }
);

// Index for leaderboard queries
rankingSchema.index({ eloRating: -1, level: -1 });

export default mongoose.model('Ranking', rankingSchema);
