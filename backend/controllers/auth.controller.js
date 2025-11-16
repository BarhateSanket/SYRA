import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import nodemailer from "nodemailer";
import logger from "../middlewares/apiLogger.js";

/**
 * Helper to remove sensitive fields before sending user object
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  if (user.password) delete user.password;
  return user;
};

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = genToken(user._id);

    // Set secure cookie for cross-site (Vercel frontend -> Render backend)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,       // required on HTTPS
      sameSite: "none",   // required for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: `Signup error: ${error.message || error}` });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: `Login error: ${error.message || error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    // Clear cookie with same cookie attributes used to set it
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: `Logout error: ${error.message || error}` });
  }
};

// 2FA Setup - Generate secret and QR code
export const setup2FA = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SYRA (${user.email})`,
      issuer: 'SYRA AI'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Save secret temporarily (will be confirmed later)
    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes.map(code => bcrypt.hashSync(code, 10));
    await user.save();

    logger.info('2FA setup initiated', { userId: user._id, email: user.email });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes // Show to user once, then they should save them
    });
  } catch (error) {
    logger.error('2FA setup error', { error: error.message, userId: req.userId });
    res.status(500).json({ message: "Failed to setup 2FA" });
  }
};

// 2FA Verification and Enable
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA setup not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (30 seconds) tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA token" });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    logger.info('2FA enabled successfully', { userId: user._id });

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    logger.error('2FA verification error', { error: error.message, userId: req.userId });
    res.status(500).json({ message: "Failed to verify 2FA" });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA token" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    logger.info('2FA disabled successfully', { userId: user._id });

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    logger.error('2FA disable error', { error: error.message, userId: req.userId });
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
};

// Verify 2FA during login
export const verifyLogin2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA not required" });
    }

    let verified = false;

    // Check TOTP token
    if (token) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    // Check backup code if TOTP failed
    if (!verified && backupCode) {
      const backupCodeIndex = user.backupCodes.findIndex(code =>
        bcrypt.compareSync(backupCode, code)
      );

      if (backupCodeIndex !== -1) {
        verified = true;
        // Remove used backup code
        user.backupCodes.splice(backupCodeIndex, 1);
        await user.save();
      }
    }

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA token or backup code" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const authToken = genToken(user._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.info('Login with 2FA successful', { userId: user._id });

    res.json({
      message: "Login successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    logger.error('2FA login verification error', { error: error.message, userId: req.userId });
    res.status(500).json({ message: "Login verification failed" });
  }
};
