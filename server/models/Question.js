import mongoose from 'mongoose';

// Question Schema - Stores quiz questions
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please add a question'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please add options'],
      validate: {
        validator: (v) => v.length === 4,
        message: 'Question must have exactly 4 options',
      },
    },
    correctAnswer: {
      type: Number, // Index of correct option (0-3)
      required: [true, 'Please specify correct answer'],
      min: 0,
      max: 3,
    },
    category: {
      type: String,
      enum: ['Tech', 'Sports', 'Movies', 'General'],
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
