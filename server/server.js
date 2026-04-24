
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from './config/db.js';
import roomRoutes from './routes/roomRoutes.js';
import questionRoutes, { seedQuestions } from './routes/questionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import publicRoomRoutes from './routes/publicRoomRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { setupSocketEvents } from './sockets/socketHandler.js';
import { configureSocketIOAdapter, setupSocketIOEvents } from './config/socketIOAdapter.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

// ✅ FIX 1: TRUST PROXY (VERY IMPORTANT)
app.set('trust proxy', 1);

// ✅ SIMPLE + SAFE CORS (no more blocking issues)
const corsOptions = {
  origin: true, // allow all origins in dev
  credentials: true,
};

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
app.use(generalLimiter);

// Logger
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// DB
connectDB();
seedQuestions();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/public-rooms', publicRoomRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/ai', aiRoutes);

// 404 API handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running ✅' });
});

// Socket setup
setupSocketEvents(io);
configureSocketIOAdapter(io);
setupSocketIOEvents(io);

// Error handler
app.use(globalErrorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`\n=== QUIZ BATTLE SERVER STARTED ===\n`);
});

export default app;