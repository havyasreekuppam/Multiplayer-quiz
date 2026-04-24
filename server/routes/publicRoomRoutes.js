import express from 'express';
import {
  createPublicRoom,
  getPublicRooms,
  kickPlayer,
  pauseQuiz,
  resumeQuiz,
} from '../controllers/publicRoomController.js';

const router = express.Router();

/**
 * Public Room Routes
 * Manage browsable public quiz rooms with host controls
 */

// Create public room
router.post('/create', createPublicRoom);

// List public rooms
router.get('/', getPublicRooms);

// Host controls
router.post('/kick', kickPlayer);
router.post('/pause', pauseQuiz);
router.post('/resume', resumeQuiz);

export default router;
