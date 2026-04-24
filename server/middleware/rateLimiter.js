import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis, redisAvailable } from '../config/redis.js';
import { logWarn } from '../utils/logger.js';

const createRedisStore = (prefix) => {
  if (!redisAvailable || !redis) {
    return undefined;
  }

  return new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix,
  });
};

const isLocalDevelopmentRequest = (req) => {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const candidateIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '';

  return (
    candidateIp === '127.0.0.1' ||
    candidateIp === '::1' ||
    candidateIp === '::ffff:127.0.0.1' ||
    candidateIp.startsWith('192.168.') ||
    candidateIp.startsWith('10.') ||
    candidateIp.startsWith('172.16.') ||
    candidateIp.startsWith('172.17.') ||
    candidateIp.startsWith('172.18.') ||
    candidateIp.startsWith('172.19.') ||
    candidateIp.startsWith('172.20.') ||
    candidateIp.startsWith('172.21.') ||
    candidateIp.startsWith('172.22.') ||
    candidateIp.startsWith('172.23.') ||
    candidateIp.startsWith('172.24.') ||
    candidateIp.startsWith('172.25.') ||
    candidateIp.startsWith('172.26.') ||
    candidateIp.startsWith('172.27.') ||
    candidateIp.startsWith('172.28.') ||
    candidateIp.startsWith('172.29.') ||
    candidateIp.startsWith('172.30.') ||
    candidateIp.startsWith('172.31.')
  );
};

/**
 * Rate Limiter Middleware
 * Prevents abuse and DDoS attacks
 * Uses Redis for distributed rate limiting
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  store: createRedisStore('rl:general:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  skip: isLocalDevelopmentRequest,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable the X-RateLimit headers
  handler: (req, res) => {
    logWarn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

/**
 * Auth rate limiter
 * 5 attempts per 15 minutes (stricter for auth)
 */
export const authLimiter = rateLimit({
  store: createRedisStore('rl:auth:'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  skip: isLocalDevelopmentRequest,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    logWarn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  },
});

/**
 * Socket.io rate limiter
 * 60 requests per minute per socket
 */
export const socketLimiter = rateLimit({
  store: createRedisStore('rl:socket:'),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 events per minute
  skip: isLocalDevelopmentRequest,
  keyGenerator: (req) => req.socket?.id || req.ip, // Use socket ID if available
  handler: (req, res) => {
    logWarn('Socket rate limit exceeded', {
      socketId: req.socket?.id,
    });

    res.status(429).json({
      success: false,
      message: 'Too many socket events, please slow down.',
    });
  },
});

/**
 * Question generation rate limiter
 * Prevent AI API abuse
 * 10 requests per hour per user
 */
export const aiGenerationLimiter = rateLimit({
  store: createRedisStore('rl:ai:'),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 generations per hour
  skip: isLocalDevelopmentRequest,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Too many AI generation requests',
  handler: (req, res) => {
    logWarn('AI rate limit exceeded', {
      userId: req.user?.id,
    });

    res.status(429).json({
      success: false,
      message: 'AI generation limit reached. Try again later.',
    });
  },
});

export default {
  generalLimiter,
  authLimiter,
  socketLimiter,
  aiGenerationLimiter,
};
