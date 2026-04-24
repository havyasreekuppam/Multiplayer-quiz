import mongoose from 'mongoose';

/**
 * Match Schema - Stores completed quiz game records
 * Used for history, statistics, and replay features
 */

const matchSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Tech', 'Sports', 'Movies', 'General'],
      default: 'General',
    },
    players: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        username: String,
        finalScore: Number,
        totalTime: Number,
        answers: [Number], // Array of selected options
        correctAnswers: Number,
      },
    ],
    winner: {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      finalScore: Number,
      totalTime: Number,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: Date.now,
    },
    questions: [mongoose.Schema.Types.ObjectId], // References to Question collection
    status: {
      type: String,
      enum: ['COMPLETED', 'ABANDONED'],
      default: 'COMPLETED',
    },
    ipAddress: String, // For analytics
  },
  { timestamps: true }
);

// Index for faster queries
matchSchema.index({ 'players.userId': 1, endedAt: -1 });
matchSchema.index({ 'winner.userId': 1 });

export default mongoose.model('Match', matchSchema);
