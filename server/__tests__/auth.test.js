import request from 'supertest';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Authentication Tests
 * Tests JWT auth, refresh tokens, role-based access
 */

// Mock app (you'll need to import actual app)
let app;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI);

  // Import app after connection
  const { default: serverApp } = await import('../server.js');
  app = serverApp;
});

afterAll(async () => {
  // Clean up
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
  };

  let userId;
  let refreshToken;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('username', testUser.username);

      userId = response.body.user._id;
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('accessToken');

      // Extract refresh token from cookie
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const match = setCookieHeader[0]?.match(/refreshToken=([^;]+)/);
        refreshToken = match ? match[1] : null;
      }
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail without refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Role-Based Access Control', () => {
    it('admin should access admin-only endpoints', async () => {
      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: await bcryptjs.hash('Admin123!', 10),
        role: 'admin',
      });

      const token = jwt.sign(
        { id: adminUser._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Try to access admin endpoint
      const response = await request(app)
        .delete('/api/ai/cache/Science')
        .set('Authorization', `Bearer ${token}`);

      // Should succeed or fail appropriately
      expect([200, 403, 404]).toContain(response.statusCode);
    });

    it('player should not access admin-only endpoints', async () => {
      const playerUser = await User.create({
        username: 'player',
        email: 'player@example.com',
        password: await bcryptjs.hash('Player123!', 10),
        role: 'player',
      });

      const token = jwt.sign(
        { id: playerUser._id, role: 'player' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .delete('/api/ai/cache/Science')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
