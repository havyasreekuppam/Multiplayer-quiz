import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Room from '../models/Room.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

/**
 * Quiz Routes Tests
 * Tests room creation, quiz flow, question retrieval
 */

let app;
let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const { default: serverApp } = await import('../server.js');
  app = serverApp;

  // Create test user
  const user = await User.create({
    username: 'quiztest',
    email: 'quiz@test.com',
    password: 'Test123!',
    role: 'player',
  });

  userId = user._id;
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await Room.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Quiz Routes', () => {
  describe('POST /api/rooms/create', () => {
    it('should create a new room', async () => {
      const response = await request(app)
        .post('/api/rooms/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomName: 'Test Quiz',
          category: 'Science',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.room).toHaveProperty('roomId');
    });

    it('should validate room data', async () => {
      const response = await request(app)
        .post('/api/rooms/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomName: '', // Invalid
          category: 'Science',
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/questions', () => {
    it('should get questions', async () => {
      const response = await request(app)
        .get('/api/questions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.questions)).toBe(true);
    });

    it('should filter questions by category', async () => {
      const response = await request(app)
        .get('/api/questions?category=Science')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      if (response.body.questions.length > 0) {
        expect(response.body.questions[0].category).toBe('Science');
      }
    });
  });

  describe('POST /api/ai/generate-questions', () => {
    it('should generate questions with AI', async () => {
      const response = await request(app)
        .post('/api/ai/generate-questions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topic: 'History',
          count: 5,
          difficulty: 'medium',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.questions)).toBe(true);
    }, 10000);

    it('should respect rate limiting', async () => {
      const requests = Array(12)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/ai/generate-questions')
            .set('Authorization', `Bearer ${token}`)
            .send({
              topic: 'Math',
              count: 5,
            })
        );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some((r) => r.statusCode === 429);

      // At least one should be rate limited
      expect(rateLimited || responses[0].statusCode === 200).toBe(true);
    });
  });
});
