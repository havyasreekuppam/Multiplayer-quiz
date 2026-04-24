import { getServerTimestamp, calculateRemainingTime, isAnswerTimely } from '../utils/gameStateManager.js';

/**
 * Game State Manager Tests
 * Tests timer synchronization and disconnect handling
 */

describe('Game State Manager', () => {
  describe('Server Timestamp Sync', () => {
    it('should return server timestamp', () => {
      const timestamp = getServerTimestamp();

      expect(timestamp).toHaveProperty('timestamp');
      expect(timestamp).toHaveProperty('iso');
      expect(typeof timestamp.timestamp).toBe('number');
      expect(typeof timestamp.iso).toBe('string');
    });
  });

  describe('Timer Calculation', () => {
    it('should calculate remaining time correctly', () => {
      const questionStartTime = Date.now() - 5000; // 5 seconds ago
      const result = calculateRemainingTime(questionStartTime, 15);

      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('elapsed');
      expect(result).toHaveProperty('isTimeUp');

      expect(result.remaining).toBeLessThanOrEqual(10);
      expect(result.elapsed).toBeGreaterThanOrEqual(5);
      expect(result.isTimeUp).toBe(false);
    });

    it('should handle time up scenario', () => {
      const questionStartTime = Date.now() - 30000; // 30 seconds ago
      const result = calculateRemainingTime(questionStartTime, 15);

      expect(result.isTimeUp).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Answer Timeliness', () => {
    it('should accept timely answers', () => {
      const questionStartTime = Date.now() - 5000; // 5 seconds ago
      const submissionTime = Date.now();

      const isTimely = isAnswerTimely(questionStartTime, submissionTime, 15);

      expect(isTimely).toBe(true);
    });

    it('should reject late answers', () => {
      const questionStartTime = Date.now() - 20000; // 20 seconds ago
      const submissionTime = Date.now();

      const isTimely = isAnswerTimely(questionStartTime, submissionTime, 15);

      expect(isTimely).toBe(false);
    });
  });
});
