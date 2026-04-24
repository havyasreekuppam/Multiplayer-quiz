import { OpenAI } from 'openai';
import { logError, logInfo } from './logger.js';

/**
 * AI Question Generator
 * Integrates with OpenAI API to generate dynamic quiz questions
 * Falls back to mock questions if API fails
 */

let openai;

/**
 * Fallback questions if API fails
 */
const fallbackQuestions = [
  {
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correct: 2,
    category: 'Geography',
    difficulty: 'easy',
  },
  {
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
    category: 'Science',
    difficulty: 'easy',
  },
  {
    text: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 3,
    category: 'Geography',
    difficulty: 'easy',
  },
];

/**
 * Generate questions using OpenAI API
 */
export const generateQuestionsWithAI = async (
  topic,
  count = 5,
  difficulty = 'medium'
) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logInfo('OpenAI API key not configured, using fallback questions');
      return fallbackQuestions.slice(0, count);
    }

    if (!openai) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    const prompt = `
Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return JSON array with this exact structure:
[
  {
    "text": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "category": "${topic}",
    "difficulty": "${difficulty}"
  }
]

Rules:
- correct is 0-3 index of correct option
- Make questions diverse and interesting
- Ensure options are plausible but distinct
- Return ONLY valid JSON, no markdown
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    // Parse JSON response
    let questions = JSON.parse(content);

    // Validate questions
    questions = questions.filter((q) =>
      q.text &&
      q.options &&
      q.options.length === 4 &&
      typeof q.correct === 'number' &&
      q.correct >= 0 &&
      q.correct < 4
    );

    if (questions.length === 0) {
      throw new Error('No valid questions generated');
    }

    logInfo('AI questions generated successfully', {
      topic,
      count: questions.length,
      difficulty,
    });

    return questions.slice(0, count);
  } catch (error) {
    logError('AI question generation failed, using fallback', error, {
      topic,
      count,
      difficulty,
    });

    // Return fallback questions on error
    return fallbackQuestions.slice(0, count);
  }
};

/**
 * Generate questions in specific format
 */
export const generateFormattedQuestions = async (
  topic,
  count = 5,
  difficulty = 'medium'
) => {
  const questions = await generateQuestionsWithAI(topic, count, difficulty);

  return questions.map((q, index) => ({
    _id: `ai_${Date.now()}_${index}`,
    text: q.text,
    category: q.category || topic,
    options: q.options,
    correctAnswer: q.correct,
    difficulty: q.difficulty || difficulty,
    source: 'AI', // Mark as AI-generated
    timestamp: new Date(),
  }));
};

export default {
  generateQuestionsWithAI,
  generateFormattedQuestions,
};
