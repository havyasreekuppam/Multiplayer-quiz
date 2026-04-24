import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Ranking from '../models/Ranking.js';
import User from '../models/User.js';

/**
 * Ranking System Tests
 * Tests ELO calculation, leaderboard, badges
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
    username: 'rankingtest',
    email: 'ranking@test.com',
    password: 'Test123!',
    role: 'player',
  });

  userId = user._id;
  token = jwt.sign({ id: userId, role: 'player' }, process.env.JWT_SECRET);

  // Create initial ranking
  await Ranking.create({
    userId,
    eloRating: 1000,
    level: 'Bronze',
  });
});

afterAll(async () => {
  await Ranking.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Ranking System', () => {
  describe('GET /api/rankings/player/:userId', () => {
    it('should get player ranking', async () => {
      const response = await request(app).get(`/api/rankings/player/${userId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.ranking).toHaveProperty('eloRating', 1000);
      expect(response.body.ranking).toHaveProperty('level', 'Bronze');
    });

    it('should create ranking if not exists', async () => {
      const newUser = await User.create({
        username: 'newplayer',
        email: 'new@test.com',
        password: 'Test123!',
      });

      const response = await request(app).get(
        `/api/rankings/player/${newUser._id}`
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.ranking.eloRating).toBe(1000);
    });
  });

  describe('GET /api/rankings/leaderboard', () => {
    it('should get leaderboard', async () => {
      const response = await request(app).get('/api/rankings/leaderboard');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/rankings/leaderboard')
        .query({ page: 1, limit: 10 });

      expect(response.statusCode).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/rankings/update-after-match', () => {
    it('should update ranking after match', async () => {
      const winner = await User.create({
        username: 'winner',
        email: 'winner@test.com',
        password: 'Test123!',
      });

      const loser = await User.create({
        username: 'loser',
        email: 'loser@test.com',
        password: 'Test123!',
      });

      await Ranking.create({ userId: winner._id, eloRating: 1000 });
      await Ranking.create({ userId: loser._id, eloRating: 1000 });

      const response = await request(app)
        .post('/api/rankings/update-after-match')
        .send({
          matchId: 'match123',
          winnerId: winner._id.toString(),
          loserId: loser._id.toString(),
          winnerScore: 800,
          loserScore: 600,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.winner).toHaveProperty('eloChange');
    });
  });

  describe('GET /api/rankings/compare', () => {
    it('should compare two players', async () => {
      const player1 = userId.toString();
      const player2 = (
        await User.create({
          username: 'player2',
          email: 'player2@test.com',
          password: 'Test123!',
        })
      )._id.toString();

      await Ranking.create({ userId: player2, eloRating: 1100 });

      const response = await request(app)
        .get('/api/rankings/compare')
        .query({ userId1: player1, userId2: player2 });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.comparison).toHaveProperty('player1');
      expect(response.body.comparison).toHaveProperty('player2');
    });
  });
});
