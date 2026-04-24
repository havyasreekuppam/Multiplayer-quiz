import mongoose from 'mongoose';

// Room Schema - Stores quiz room information
const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    admin: {
      type: String, // username of room creator
      required: true,
    },
    players: [
      {
        userId: String,
        username: String,
        score: {
          type: Number,
          default: 0,
        },
        answers: [Number], // Index of selected option for each question
        currentQuestionIndex: {
          type: Number,
          default: 0,
        },
        totalTime: {
          type: Number,
          default: 0,
        },
        isFinished: {
          type: Boolean,
          default: false,
        },
        finishedAt: Date,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: String,
      enum: ['Tech', 'Sports', 'Movies', 'General'],
      default: 'General',
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: -1, // -1 means quiz not started
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'WAITING',
    },
    questions: [mongoose.Schema.Types.ObjectId], // References to Question collection
    startedAt: Date,
    endedAt: Date,
    maxPlayers: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
