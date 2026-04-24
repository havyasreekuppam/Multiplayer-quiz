import mongoose from 'mongoose';

/**
 * Refresh Token Model
 * Stores refresh tokens for JWT rotation
 * Allows users to get new access tokens without re-logging in
 */

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired tokens
    },
    revokedAt: Date, // For manual revocation (logout)
    ipAddress: String, // Track IP for security
    userAgent: String, // Track browser for security
  },
  { timestamps: true }
);

// Index for cleanup queries
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
