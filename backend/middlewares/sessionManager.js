const User = require('../models/user.model.js');
const logger = require('./apiLogger.js');

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Enhanced authentication middleware with session management
const enhancedAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    // Verify JWT token (existing logic)
    let payload;
    try {
      const jwt = await import('jsonwebtoken');
      payload = jwt.default.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      logger.warn('Invalid JWT token', { error: err.message, ip: req.ip });
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if user exists and is active
    const user = await User.findById(payload.userId);
    if (!user) {
      logger.warn('User not found for token', { userId: payload.userId });
      return res.status(401).json({ message: "User not found" });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      logger.warn('Suspended account access attempt', { userId: user._id });
      return res.status(403).json({
        message: "Account suspended",
        reason: user.suspensionReason || "Contact support for assistance"
      });
    }

    if (user.accountStatus === 'locked') {
      logger.warn('Locked account access attempt', { userId: user._id });
      return res.status(403).json({
        message: "Account locked due to security policy",
        unlockTime: user.lockUntil
      });
    }

    if (user.accountStatus === 'pending_deletion') {
      logger.warn('Pending deletion account access attempt', { userId: user._id });
      return res.status(403).json({
        message: "Account pending deletion"
      });
    }

    // Check if account is locked due to failed login attempts
    if (user.lockUntil && user.lockUntil > Date.now()) {
      logger.warn('Account temporarily locked', {
        userId: user._id,
        lockUntil: user.lockUntil
      });
      return res.status(423).json({
        message: "Account temporarily locked due to failed login attempts",
        retryAfter: Math.ceil((user.lockUntil - Date.now()) / 1000)
      });
    }

    // Reset login attempts if lock time has passed
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Attach user info to request
    req.userId = user._id;
    req.user = user;

    // Update last activity (could be used for session timeout)
    user.lastActivityAt = new Date();
    await user.save();

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Login attempt tracking middleware
const trackLoginAttempts = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      // Check if account is already locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        logger.warn('Login attempt on locked account', {
          email,
          userId: user._id,
          lockUntil: user.lockUntil
        });
        return res.status(423).json({
          message: "Account temporarily locked",
          retryAfter: Math.ceil((user.lockUntil - Date.now()) / 1000)
        });
      }

      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account if max attempts reached
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        logger.warn('Account locked due to failed attempts', {
          email,
          userId: user._id,
          attempts: user.loginAttempts
        });
      }

      await user.save();
    }

    next();
  } catch (error) {
    logger.error('Login attempt tracking error', { error: error.message });
    next(); // Don't block login due to tracking error
  }
};

// Password validation middleware
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next();
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Password does not meet security requirements',
      errors
    });
  }

  next();
};

module.exports = {
  enhancedAuth,
  trackLoginAttempts,
  validatePasswordStrength,
  checkSessionTimeout,
  require2FA
};

// Session timeout middleware
const checkSessionTimeout = (timeoutHours = 24) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const timeoutMs = timeoutHours * 60 * 60 * 1000;
    const lastActivity = new Date(req.user.lastActivityAt || req.user.createdAt);
    const now = new Date();

    if (now - lastActivity > timeoutMs) {
      logger.info('Session timeout', { userId: req.user._id });
      return res.status(401).json({ message: "Session expired" });
    }

    next();
  };
};

// 2FA requirement check
const require2FA = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Skip 2FA check for 2FA setup/verification endpoints
  const skipPaths = ['/api/auth/setup-2fa', '/api/auth/verify-2fa', '/api/auth/disable-2fa'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  if (req.user.twoFactorEnabled && !req.twoFactorVerified) {
    return res.status(403).json({
      message: "2FA verification required",
      requires2FA: true
    });
  }

  next();
};
