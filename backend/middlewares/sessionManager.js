import User from "../models/user.model.js";
import logger from "./apiLogger.js";
import jwt from "jsonwebtoken";

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

/**
 * ENHANCED AUTH (MAIN MIDDLEWARE)
 */
export const enhancedAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn("Invalid JWT token", { error: err.message, ip: req.ip });
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      logger.warn("User not found for token", { userId: payload.userId });
      return res.status(401).json({ message: "User not found" });
    }

    // Check account states
    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        message: "Account suspended",
        reason: user.suspensionReason || "Contact support",
      });
    }

    if (user.accountStatus === "locked") {
      return res.status(403).json({
        message: "Account locked",
        unlockTime: user.lockUntil,
      });
    }

    // Temp lock (too many login attempts)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Account temporarily locked",
        retryAfter: Math.ceil((user.lockUntil - Date.now()) / 1000),
      });
    }

    // Reset attempt counter after lock expired
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Attach user
    req.userId = user._id;
    req.user = user;

    // Update session activity
    user.lastActivityAt = new Date();
    await user.save();

    next();
  } catch (error) {
    logger.error("Authentication error", { error: error.message });
    return res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * LOGIN ATTEMPT TRACKER
 */
export const trackLoginAttempts = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next();

  try {
    const user = await User.findOne({ email });
    if (!user) return next();

    // Account already locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Account temporarily locked",
        retryAfter: Math.ceil((user.lockUntil - Date.now()) / 1000),
      });
    }

    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }

    await user.save();
    next();
  } catch (error) {
    logger.error("Login tracking error", error.message);
    next();
  }
};

/**
 * PASSWORD STRENGTH VALIDATOR
 */
export const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) return next();

  const errors = [];
  if (password.length < 8) errors.push("Min 8 characters required");
  if (!/(?=.*[a-z])/.test(password)) errors.push("Must contain lowercase letter");
  if (!/(?=.*[A-Z])/.test(password)) errors.push("Must contain uppercase letter");
  if (!/(?=.*\d)/.test(password)) errors.push("Must contain number");
  if (!/(?=.*[@$!%*?&])/.test(password)) errors.push("Must contain special character");

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Password does not meet requirements",
      errors,
    });
  }

  next();
};

/**
 * SESSION TIMEOUT MIDDLEWARE
 */
export const checkSessionTimeout = (timeoutHours = 24) => {
  return async (req, res, next) => {
    if (!req.user) return next();

    const timeoutMs = timeoutHours * 60 * 60 * 1000;
    const lastActivity = new Date(req.user.lastActivityAt || req.user.createdAt);

    if (Date.now() - lastActivity > timeoutMs) {
      return res.status(401).json({ message: "Session expired" });
    }

    next();
  };
};

/**
 * 2FA PROTECTION
 */
export const require2FA = (req, res, next) => {
  if (!req.user) return next();

  const skip = [
    "/api/auth/setup-2fa",
    "/api/auth/verify-2fa",
    "/api/auth/disable-2fa",
  ];

  if (skip.includes(req.path)) return next();

  if (req.user.twoFactorEnabled && !req.twoFactorVerified) {
    return res.status(403).json({
      message: "2FA verification required",
      requires2FA: true,
    });
  }

  next();
};
