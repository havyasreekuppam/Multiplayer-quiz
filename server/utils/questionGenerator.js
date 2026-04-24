/**
 * AI Question Generator - Mock Implementation
 * Later can be extended with OpenAI API
 */

const mockQuestionTemplates = {
  tech: [
    {
      question: 'What does ${1} stand for?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 0,
    },
    {
      question: 'Which of these is a ${1} concept?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 1,
    },
  ],
  sports: [
    {
      question: 'In which year was the ${1} Olympics held?',
      options: ['2010', '2012', '2014', '2016'],
      correct: 1,
    },
    {
      question: 'How many players are on a ${1} team?',
      options: ['9', '10', '11', '12'],
      correct: 2,
    },
  ],
  general: [
    {
      question: 'What is the capital of ${1}?',
      options: ['City A', 'City B', 'City C', 'City D'],
      correct: 0,
    },
  ],
};

const questionDatabase = {
  tech: [
    'API', 'Database', 'Algorithm', 'Framework', 'Library',
    'Encryption', 'Authentication', 'Cloud', 'Server', 'Protocol',
  ],
  sports: [
    'India', 'USA', 'France', 'Japan', 'Brazil',
  ],
  general: [
    'France', 'Japan', 'Italy', 'Spain', 'Germany', 'Australia',
  ],
};

export const generateMockQuestions = (category = 'general', count = 5) => {
  const templates = mockQuestionTemplates[category] || mockQuestionTemplates.general;
  const database = questionDatabase[category] || questionDatabase.general;

  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const randomItem = database[Math.floor(Math.random() * database.length)];

    const question = {
      category,
      question: template.question.replace('${1}', randomItem),
      options: template.options,
      correct: template.correct,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      timeLimit: 15,
    };

    questions.push(question);
  }

  return questions;
};

/**
 * Future: Integrate with OpenAI API
 * export const generateQuestionsWithOpenAI = async (category, count) => {
 *   const response = await openai.createCompletion({
 *     model: 'text-davinci-003',
 *     prompt: `Generate ${count} quiz questions about ${category}...`,
 *     max_tokens: 2000,
 *   });
 *   return parseResponse(response);
 * };
 */

export default { generateMockQuestions };
