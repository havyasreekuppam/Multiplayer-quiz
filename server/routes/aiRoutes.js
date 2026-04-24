import express from 'express';
import { generateQuestions, clearTopicCache } from '../controllers/aiController.js';
import { verifyAccessToken, authorize } from '../middleware/advancedAuthMiddleware.js';
import { aiGenerationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * AI Routes
 * Protected endpoints for AI-powered features
 */

// Generate questions using AI
// POST /api/ai/generate-questions
// Body: { topic: string, count: number, difficulty: "easy|medium|hard" }
router.post(
  '/generate-questions',
  verifyAccessToken,
  aiGenerationLimiter,
  generateQuestions
);

// Clear cache for a topic (admin only)
// DELETE /api/ai/cache/:topic
router.delete(
  '/cache/:topic',
  verifyAccessToken,
  authorize(['admin']),
  clearTopicCache
);

export default router;
