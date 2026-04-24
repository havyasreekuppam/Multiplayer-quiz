import User from "../models/User.js";
import { verifyFirebaseIdToken } from "../config/firebaseAdmin.js";
import logger from "../utils/logger.js";

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  score: user.score,
  totalGames: user.totalGames,
  wins: user.wins,
  averageScore: user.averageScore,
  createdAt: user.createdAt,
});

const getUsernameFromToken = (decodedToken) => {
  if (decodedToken.name) {
    return decodedToken.name.trim();
  }

  if (decodedToken.email) {
    return decodedToken.email.split("@")[0];
  }

  return `player-${decodedToken.uid.slice(0, 6)}`;
};

const verifyRequestToken = async (req, expectedEmail) => {
  const idToken = req.body.idToken || req.headers.authorization?.split(" ")[1];

  if (!idToken) {
    return {
      error: {
        success: false,
        message: "❌ Firebase ID token is required",
        statusCode: 401,
      },
    };
  }

  const decodedToken = await verifyFirebaseIdToken(idToken);

  if (expectedEmail && decodedToken.email !== expectedEmail) {
    return {
      error: {
        success: false,
        message: "❌ Token email does not match request email",
        statusCode: 401,
      },
    };
  }

  return { decodedToken, idToken };
};

export const register = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: "❌ Please provide username and email",
      });
    }

    const { decodedToken, idToken, error } = await verifyRequestToken(
      req,
      email,
    );
    if (error) {
      return res.status(error.statusCode).json(error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { firebaseUid: decodedToken.uid }],
    });

    if (existingUser) {
      logger.warn("Registration attempt with existing email/username", {
        email,
        username,
      });
      return res.status(400).json({
        success: false,
        message: "❌ User already exists with that email or username",
      });
    }

    const user = await User.create({
      username,
      email,
      firebaseUid: decodedToken.uid,
      role: "player",
      isLoggedIn: true,
      lastLogin: new Date(),
    });

    logger.info("User registered successfully", { userId: user._id, email });

    res.status(201).json({
      success: true,
      message: "✅ Firebase user registered successfully",
      accessToken: idToken,
      token: idToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "❌ Please provide email",
      });
    }

    const { decodedToken, idToken, error } = await verifyRequestToken(
      req,
      email,
    );
    if (error) {
      return res.status(error.statusCode).json(error);
    }

    let user = await User.findOne({
      $or: [{ firebaseUid: decodedToken.uid }, { email }],
    });

    if (!user) {
      user = await User.create({
        username: getUsernameFromToken(decodedToken),
        email,
        firebaseUid: decodedToken.uid,
        role: "player",
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid = decodedToken.uid;
    }

    // Update last login
    user.lastLogin = new Date();
    user.isLoggedIn = true;
    await user.save();

    logger.info("User logged in successfully", { userId: user._id, email });

    res.status(200).json({
      success: true,
      message: "✅ Firebase login successful",
      accessToken: idToken,
      token: idToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("🔥 FULL LOGIN ERROR:", error); // ADD THIS
    logger.error("Login error", { error: error.message });

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * Refresh access token using refresh token
 * Called when access token expires
 */
export const refreshAccessToken = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Firebase handles token refresh on the client. Use Firebase getIdToken(true).",
  });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Profile fetch error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, avatar },
      { new: true, runValidators: true },
    );

    logger.info("Profile updated", { userId: req.userId });

    res.status(200).json({
      success: true,
      message: "✅ Profile updated",
      user,
    });
  } catch (error) {
    logger.error("Profile update error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

/**
 * Enhanced logout that revokes all refresh tokens
 */
export const logout = async (req, res) => {
  try {
    const userId = req.userId;

    // Update user status
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });

    logger.info("User logged out", { userId });

    res.status(200).json({
      success: true,
      message: "✅ Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};
