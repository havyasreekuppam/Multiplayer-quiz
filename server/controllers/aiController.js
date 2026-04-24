import { generateFormattedQuestions } from '../utils/aiQuestionGenerator.js';
import { setCacheWithTTL, getFromCache, deleteFromCache } from '../config/redis.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * AI Controller
 * Handles AI-powered features like question generation
 */

/**
 * Generate quiz questions using AI
 */
export const generateQuestions = async (req, res) => {
  try {
    const { topic, count = 5, difficulty = 'medium' } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    if (count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 20',
      });
    }

    // Check cache first
    const cacheKey = `ai_questions_${topic}_${count}_${difficulty}`;
    const cached = await getFromCache(cacheKey);

    if (cached) {
      logInfo('Questions served from cache', { topic, count });
      return res.status(200).json({
        success: true,
        message: '✅ Questions generated (cached)',
        questions: cached,
        cached: true,
      });
    }

    // Generate new questions
    const questions = await generateFormattedQuestions(topic, count, difficulty);

    // Cache for 24 hours
    await setCacheWithTTL(cacheKey, questions, 86400);

    logInfo('AI questions generated', {
      topic,
      count: questions.length,
      difficulty,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: '✅ Questions generated successfully',
      questions,
      cached: false,
    });
  } catch (error) {
    logError('Question generation failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message,
    });
  }
};

/**
 * Clear cache for a topic
 */
export const clearTopicCache = async (req, res) => {
  try {
    const { topic } = req.params;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    // Delete all variations of this topic from cache
    // This is simplified - in production use Redis SCAN
    const difficulties = ['easy', 'medium', 'hard'];
    const counts = [5, 10, 15, 20];

    for (const diff of difficulties) {
      for (const count of counts) {
        const key = `ai_questions_${topic}_${count}_${diff}`;
        await deleteFromCache(key);
      }
    }

    logInfo('Topic cache cleared', { topic });

    res.status(200).json({
      success: true,
      message: '✅ Cache cleared',
    });
  } catch (error) {
    logError('Cache clear failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
    });
  }
};

export default {
  generateQuestions,
  clearTopicCache,
};
