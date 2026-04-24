/**
 * API Helper - Centralized API calls
 * Simplify API communication from components
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Generic fetch wrapper
 */
const apiCall = async (method, endpoint, data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

/**
 * Room APIs
 */
export const roomAPI = {
  createRoom: (roomName, username, category, totalQuestions) =>
    apiCall('POST', '/rooms/create-room', {
      roomName,
      username,
      category,
      totalQuestions,
    }),

  joinRoom: (roomId, username) =>
    apiCall('POST', '/rooms/join-room', {
      roomId,
      username,
    }),

  getRoomDetails: (roomId) => apiCall('GET', `/rooms/room/${roomId}`),

  getLeaderboard: (roomId) => apiCall('GET', `/rooms/leaderboard/${roomId}`),

  submitAnswer: (roomId, username, questionIndex, selectedAnswer) =>
    apiCall('POST', '/rooms/submit-answer', {
      roomId,
      username,
      questionIndex,
      selectedAnswer,
    }),
};

/**
 * Question APIs
 */
export const questionAPI = {
  getQuestionsByCategory: (category) =>
    apiCall('GET', `/questions/${category}`),

  getAllQuestions: () => apiCall('GET', '/questions/all'),
};

/**
 * Health check
 */
export const healthAPI = {
  checkServer: () => apiCall('GET', '/health'),
};

export default {
  roomAPI,
  questionAPI,
  healthAPI,
};
