import User from '../models/User.js';
import { logError, logInfo, logWarn } from '../utils/logger.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';

/**
 * Advanced Authentication Middleware
 * Handles Firebase token verification with role checks
 */

/**
 * Verify access token and extract user info
 */
export const verifyAccessToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logWarn('No token provided', { ip: req.ip, path: req.path });
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = await verifyFirebaseIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'player',
    };

    // Check if user still exists and is active
    const user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
    });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or inactive',
      });
    }

    req.userId = user._id.toString();
    req.role = user.role;
    next();
  } catch (error) {
    logError('Token verification failed', error, { ip: req.ip });
    return res.status(401).json({
      success: false,
      message: 'Invalid Firebase token',
    });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Firebase handles token refresh on the client.',
  });
};

/**
 * Check user role
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found',
      });
    }

    const userRole = req.user.role || 'player';

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      logWarn('Unauthorized role access', {
        userId: req.user.id,
        requiredRole: allowedRoles,
        userRole,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Revoke all refresh tokens for user (logout)
 */
export const revokeAllTokens = async (userId) => {
  logInfo('Token revocation delegated to Firebase session handling', { userId });
};

export default {
  verifyAccessToken,
  refreshAccessToken,
  authorize,
  revokeAllTokens,
};
