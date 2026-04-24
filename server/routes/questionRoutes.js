import express from 'express';
import Question from '../models/Question.js';
import { generateMockQuestions } from '../utils/questionGenerator.js';

const router = express.Router();

// SEED SAMPLE QUESTIONS
export const seedQuestions = async () => {
  try {
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log('✅ Questions already seeded');
      return;
    }

    const sampleQuestions = [
      // Tech Questions
      {
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Text Markup Language',
          'Hyperlinks and Text Markup Language',
          'Home Tool Markup Language',
        ],
        correctAnswer: 0,
        category: 'Tech',
        difficulty: 'Easy',
      },
      {
        question: 'Which company developed Python?',
        options: ['Microsoft', 'Apple', 'Guido van Rossum (Open Source)', 'Google'],
        correctAnswer: 2,
        category: 'Tech',
        difficulty: 'Medium',
      },
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correctAnswer: 2,
        category: 'Tech',
        difficulty: 'Hard',
      },
      {
        question: 'Which protocol is used for secure web communication?',
        options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
        correctAnswer: 1,
        category: 'Tech',
        difficulty: 'Easy',
      },
      {
        question: 'What does API stand for?',
        options: [
          'Application Programming Interface',
          'Advanced Programming Interaction',
          'Application Process Interface',
          'Advanced Process Infrastructure',
        ],
        correctAnswer: 0,
        category: 'Tech',
        difficulty: 'Easy',
      },
      // Sports Questions
      {
        question: 'How many players are on a soccer/football team on the field?',
        options: ['9', '10', '11', '12'],
        correctAnswer: 2,
        category: 'Sports',
        difficulty: 'Easy',
      },
      {
        question: 'In which sport is the term "Love" used for zero score?',
        options: ['Cricket', 'Tennis', 'Basketball', 'Golf'],
        correctAnswer: 1,
        category: 'Sports',
        difficulty: 'Medium',
      },
      {
        question: 'How many rings are on the Olympic flag?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1,
        category: 'Sports',
        difficulty: 'Easy',
      },
      {
        question: 'What is the maximum break in snooker?',
        options: ['120', '140', '147', '150'],
        correctAnswer: 2,
        category: 'Sports',
        difficulty: 'Hard',
      },
      // Movies Questions
      {
        question: 'Which movie won the Academy Award for Best Picture in 2020?',
        options: [
          '1917',
          'Parasite',
          'Joker',
          'Once Upon a Time in Hollywood',
        ],
        correctAnswer: 1,
        category: 'Movies',
        difficulty: 'Medium',
      },
      {
        question: 'Who directed the movie "Inception"?',
        options: ['Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'James Cameron'],
        correctAnswer: 1,
        category: 'Movies',
        difficulty: 'Easy',
      },
      // General Questions
      {
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        category: 'General',
        difficulty: 'Easy',
      },
      {
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        category: 'General',
        difficulty: 'Easy',
      },
      {
        question: 'What is the largest planet in our solar system?',
        options: ['Saturn', 'Neptune', 'Jupiter', 'Mars'],
        correctAnswer: 2,
        category: 'General',
        difficulty: 'Easy',
      },
    ];

    await Question.insertMany(sampleQuestions);
    console.log('✅ Sample questions seeded successfully');
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
  }
};

// GET ALL QUESTIONS
router.get('/all', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GENERATE MOCK QUESTIONS (Dynamic Question Generation)
router.post('/generate', async (req, res) => {
  try {
    const { category = 'general', count = 5 } = req.body;

    // Validate input
    if (count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        message: '❌ Count must be between 1 and 20',
      });
    }

    // Generate mock questions
    const generatedQuestions = generateMockQuestions(category, count);

    // Save to database (optional)
    // const savedQuestions = await Question.insertMany(generatedQuestions);

    res.status(201).json({
      success: true,
      message: '✅ Questions generated successfully',
      count: generatedQuestions.length,
      questions: generatedQuestions,
      note: 'Mock data - integrate with OpenAI API for production',
    });
  } catch (error) {
    console.error('❌ Generate Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating questions',
      error: error.message,
    });
  }
});

export default router;
