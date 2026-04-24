import User from '../models/User.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';

/**
 * Authentication Middleware - Protects routes
 * Verifies Firebase ID token and adds user info to request
 */

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '❌ No authorization token provided',
      });
    }

    const decoded = await verifyFirebaseIdToken(token);
    const user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '❌ User account not found',
      });
    }

    req.userId = user._id.toString();
    req.email = user.email;
    req.role = user.role || 'player';
    req.firebaseUser = decoded;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '❌ Invalid or expired Firebase token',
      error: error.message,
    });
  }
};

export default { protect };
