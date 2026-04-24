/**
 * Socket.io Adapter Configuration
 * Enables Socket.io to work across multiple servers with Redis
 */

import { createAdapter } from '@socket.io/redis-adapter';
import { redis, redisAvailable } from '../config/redis.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Configure Socket.io with Redis adapter
 * This allows communication between multiple server instances
 */
export const configureSocketIOAdapter = (io) => {
  try {
    if (!redisAvailable || !redis) {
      logInfo('Redis adapter skipped; using in-memory Socket.io adapter');
      return;
    }

    io.adapter(createAdapter(redis, redis.duplicate()));
    logInfo('✅ Socket.io Redis adapter configured successfully');
  } catch (error) {
    logError('Failed to configure Socket.io adapter', error);
    throw error;
  }
};

/**
 * Setup Socket.io events with proper namespacing
 */
export const setupSocketIOEvents = (io) => {
  io.on('connection', (socket) => {
    logInfo('Player connected', {
      socketId: socket.id,
      ip: socket.handshake.address,
    });

    // Join room
    socket.on('joinRoom', (roomId, userId) => {
      socket.join(roomId);
      logInfo('Player joined room', { roomId, userId, socketId: socket.id });

      // Broadcast to room
      io.to(roomId).emit('playerJoined', {
        userId,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Leave room
    socket.on('leaveRoom', (roomId, userId) => {
      socket.leave(roomId);
      logInfo('Player left room', { roomId, userId });

      io.to(roomId).emit('playerLeft', {
        userId,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logInfo('Player disconnected', { socketId: socket.id });

      // Notify all rooms this socket was in
      for (const room of socket.rooms) {
        io.to(room).emit('playerDisconnected', {
          socketId: socket.id,
          timestamp: Date.now(),
        });
      }
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      logInfo('Player reconnected', { socketId: socket.id });

      socket.emit('reconnected', {
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });
  });
};

export default {
  configureSocketIOAdapter,
  setupSocketIOEvents,
};
