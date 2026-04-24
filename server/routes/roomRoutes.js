import express from 'express';
import {
  createRoom,
  joinRoom,
  getQuestionsByCategory,
  getRoomDetails,
  submitAnswer,
  updateLeaderboard,
} from '../controllers/roomController.js';

const router = express.Router();

// Room routes
router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);
router.get('/room/:roomId', getRoomDetails);

// Question routes
router.get('/questions/:category', getQuestionsByCategory);

// Game routes
router.post('/submit-answer', submitAnswer);
router.get('/leaderboard/:roomId', updateLeaderboard);

export default router;
