import { logInfo, logError, logDebug } from './logger.js';
import { redis } from '../config/redis.js';

/**
 * Game State Manager
 * Handles:
 * - Player disconnect/reconnect
 * - Game state persistence
 * - Server-side submission locking
 * - Timer synchronization with server timestamp
 */

const GAME_STATE_TTL = 30 * 60; // 30 minutes
const SUBMISSION_LOCK_TTL = 60; // 1 minute

/**
 * Save game state when player joins
 */
export const saveGameState = async (roomId, userId, gameState) => {
  try {
    const key = `game:${roomId}:${userId}`;
    const data = {
      roomId,
      userId,
      ...gameState,
      savedAt: Date.now(),
    };

    await redis.setEx(key, GAME_STATE_TTL, JSON.stringify(data));
    logDebug('Game state saved', { roomId, userId });
  } catch (error) {
    logError('Failed to save game state', error, { roomId, userId });
  }
};

/**
 * Retrieve game state for reconnecting player
 */
export const getGameState = async (roomId, userId) => {
  try {
    const key = `game:${roomId}:${userId}`;
    const data = await redis.get(key);

    if (data) {
      logInfo('Game state retrieved for reconnect', { roomId, userId });
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    logError('Failed to retrieve game state', error, { roomId, userId });
    return null;
  }
};

/**
 * Clear game state when game ends
 */
export const clearGameState = async (roomId, userId) => {
  try {
    const key = `game:${roomId}:${userId}`;
    await redis.del(key);
    logDebug('Game state cleared', { roomId, userId });
  } catch (error) {
    logError('Failed to clear game state', error, { roomId, userId });
  }
};

/**
 * Check if player already submitted answer (prevent double submission)
 */
export const checkSubmissionLock = async (roomId, userId, questionIndex) => {
  try {
    const key = `submission:${roomId}:${userId}:${questionIndex}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    logError('Failed to check submission lock', error);
    return false;
  }
};

/**
 * Lock submission to prevent multiple answers to same question
 */
export const lockSubmission = async (roomId, userId, questionIndex) => {
  try {
    const key = `submission:${roomId}:${userId}:${questionIndex}`;
    await redis.setEx(key, SUBMISSION_LOCK_TTL, 'locked');
    logDebug('Submission locked', { roomId, userId, questionIndex });
  } catch (error) {
    logError('Failed to lock submission', error);
  }
};

/**
 * Get server timestamp for timer synchronization
 * Ensures all clients use same server time (no cheating with client time)
 */
export const getServerTimestamp = () => {
  return {
    timestamp: Date.now(),
    iso: new Date().toISOString(),
  };
};

/**
 * Calculate remaining time for a question (server-side)
 * Uses server timestamps instead of client-side timers
 */
export const calculateRemainingTime = (questionStartTime, duration = 15) => {
  const now = Date.now();
  const elapsed = (now - questionStartTime) / 1000; // Convert to seconds
  const remaining = Math.max(0, duration - elapsed);

  return {
    remaining: Math.ceil(remaining),
    elapsed: Math.ceil(elapsed),
    isTimeUp: remaining <= 0,
  };
};

/**
 * Check if answer is submitted within time limit
 */
export const isAnswerTimely = (
  questionStartTime,
  submissionTime,
  duration = 15
) => {
  const elapsedMs = submissionTime - questionStartTime;
  const elapsedSeconds = elapsedMs / 1000;
  return elapsedSeconds <= duration;
};

/**
 * Handle player reconnection
 * Restore state if within game timeout
 */
export const handleReconnection = async (roomId, userId) => {
  try {
    const gameState = await getGameState(roomId, userId);

    if (gameState) {
      const timeSinceSave = Date.now() - gameState.savedAt;
      const timeoutMs = GAME_STATE_TTL * 1000;

      if (timeSinceSave < timeoutMs) {
        logInfo('Player reconnection successful', { roomId, userId });
        return {
          success: true,
          gameState,
          message: 'Game resumed',
        };
      } else {
        logInfo('Game state expired', { roomId, userId, timeSinceSave });
        await clearGameState(roomId, userId);
      }
    }

    return {
      success: false,
      message: 'No active game found',
    };
  } catch (error) {
    logError('Reconnection handling failed', error, { roomId, userId });
    return {
      success: false,
      message: 'Reconnection error',
      error: error.message,
    };
  }
};

/**
 * Register player in room (for disconnect detection)
 */
export const registerPlayerInRoom = async (roomId, userId) => {
  try {
    const key = `room:players:${roomId}`;
    await redis.sAdd(key, userId);
    await redis.expire(key, GAME_STATE_TTL);
    logDebug('Player registered in room', { roomId, userId });
  } catch (error) {
    logError('Failed to register player', error, { roomId, userId });
  }
};

/**
 * Unregister player from room
 */
export const unregisterPlayerFromRoom = async (roomId, userId) => {
  try {
    const key = `room:players:${roomId}`;
    await redis.sRem(key, userId);
    logDebug('Player unregistered from room', { roomId, userId });
  } catch (error) {
    logError('Failed to unregister player', error, { roomId, userId });
  }
};

export default {
  saveGameState,
  getGameState,
  clearGameState,
  checkSubmissionLock,
  lockSubmission,
  getServerTimestamp,
  calculateRemainingTime,
  isAnswerTimely,
  handleReconnection,
  registerPlayerInRoom,
  unregisterPlayerFromRoom,
};
