import express from 'express';
import {
  createMatch,
  getUserMatches,
  getMatchDetails,
  getUserStats,
  getLeaderboard,
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Match Routes - Game history and statistics
 * Track completed games, player stats, and leaderboard
 */

// Public routes
router.post('/create', createMatch); // Called when quiz ends
router.get('/user/:userId', getUserMatches); // Get user's match history
router.get('/:matchId', getMatchDetails); // Get specific match details
router.get('/stats/:userId', getUserStats); // Get user statistics
router.get('/global/leaderboard', getLeaderboard); // Global leaderboard

export default router;
