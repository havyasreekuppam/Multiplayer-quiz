import express from 'express';
import {
  getRanking,
  getLeaderboard,
  updateRankingAfterMatch,
  compareRankings,
} from '../controllers/rankingController.js';

const router = express.Router();

/**
 * Ranking Routes
 * Manage player rankings and ELO ratings
 */

// Get leaderboard (public)
router.get('/leaderboard', getLeaderboard);

// Get player ranking (public)
router.get('/player/:userId', getRanking);

// Compare two players (public)
router.get('/compare', compareRankings);

// Update ranking after match (internal - protected)
router.post('/update-after-match', updateRankingAfterMatch);

export default router;
