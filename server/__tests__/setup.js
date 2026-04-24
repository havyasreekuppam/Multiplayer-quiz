/**
 * Jest Test Setup
 * Configures test environment before running tests
 */

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/quiz_battle_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Set test timeout
jest.setTimeout(30000);

// Suppress console during tests (optional)
// global.console = {
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };
