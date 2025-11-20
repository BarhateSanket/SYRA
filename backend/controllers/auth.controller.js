import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import logger from "../utils/logger.js";   // <-- FIXED logger import

/**
 * Remove sensitive fields before sending user
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.twoFactorSecret;
  delete user.backupCodes;
  delete user.faceEmbeddings;
  return user;
};

/* -----------------------------------------------------------
   SIGNUP
----------------------------------------------------------- */
export const signUp = async (req, res) => {
   try {
     const { name, email, password } = req.body;

     if (!name || !email || !password)
       return res.status(400).json({ message: "Name, email and password are required" });

     const existEmail = await User.findOne({ email });
     if (existEmail)
       return res.status(400).json({ message: "Email already exists" });

     if (password.length < 6)
       return res.status(400).json({ message: "Password must be 6+ characters" });

     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await User.create({
       name,
       email,
       password: hashedPassword,
     });

     const token = genToken(user._id);

     res.cookie("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000,
       path: "/",
     });

     return res.status(201).json(sanitizeUser(user));
   } catch (error) {
     logger.error("Signup error", error.message);
     res.status(500).json({ message: "Signup failed" });
   }
 };

/* -----------------------------------------------------------
   LOGIN (2FA-aware)
----------------------------------------------------------- */
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email }).select("+password +twoFactorEnabled");

    if (!user)
      return res.status(400).json({ message: "Email does not exist" });

    // Account lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Too many attempts. Account locked. Try again later."
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      await user.save();

      return res.status(400).json({ message: "Incorrect password" });
    }

    // Reset lock
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // If 2FA enabled → DO NOT LOGIN YET
    if (user.twoFactorEnabled) {
      return res.json({
        requires2FA: true,
        message: "2FA verification required"
      });
    }

    // If face auth enabled → DO NOT LOGIN YET
    if (user.faceAuthEnabled) {
      return res.json({
        requiresFaceAuth: true,
        message: "Face verification required"
      });
    }

    // No additional auth → normal login
    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json(sanitizeUser(user));

  } catch (error) {
    logger.error("Login error", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

/* -----------------------------------------------------------
   LOGOUT
----------------------------------------------------------- */
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    logger.error("Logout error", error.message);
    res.status(500).json({ message: "Logout failed" });
  }
};

/* -----------------------------------------------------------
   2FA SETUP (generate secret + QR + backup codes)
----------------------------------------------------------- */
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.twoFactorEnabled)
      return res.status(400).json({ message: "2FA already enabled" });

    const secret = speakeasy.generateSecret({
      name: `SYRA (${user.email})`,
      issuer: "SYRA AI"
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    // Create 10 backup codes
    const backupCodesPlain = [];
    const backupCodesHashed = [];

    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      backupCodesPlain.push(code);
      backupCodesHashed.push(await bcrypt.hash(code, 10));
    }

    // Store secret & codes temporarily
    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodesHashed;
    await user.save();

    logger.info("2FA setup initialized", user._id);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: backupCodesPlain
    });

  } catch (error) {
    logger.error("2FA setup error", error.message);
    res.status(500).json({ message: "Failed to setup 2FA" });
  }
};

/* -----------------------------------------------------------
   VERIFY & ENABLE 2FA
----------------------------------------------------------- */
export const verify2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("+twoFactorSecret");

    if (!user || !user.twoFactorSecret)
      return res.status(400).json({ message: "2FA setup not started" });

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: req.body.token,
      window: 2
    });

    if (!valid)
      return res.status(400).json({ message: "Invalid 2FA token" });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA enabled" });

  } catch (error) {
    logger.error("2FA verification error", error.message);
    res.status(500).json({ message: "Error verifying 2FA" });
  }
};

/* -----------------------------------------------------------
   DISABLE 2FA
----------------------------------------------------------- */
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("+twoFactorSecret");

    if (!user.twoFactorEnabled)
      return res.status(400).json({ message: "2FA not enabled" });

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: req.body.token,
      window: 2
    });

    if (!valid)
      return res.status(400).json({ message: "Invalid 2FA token" });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();

    res.json({ message: "2FA disabled" });

  } catch (error) {
    logger.error("Disable 2FA error", error.message);
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
};

/* -----------------------------------------------------------
   VERIFY LOGIN 2FA (final login step)
----------------------------------------------------------- */
export const verifyLogin2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;

    const user = await User.findById(req.userId)
      .select("+twoFactorSecret +backupCodes");

    if (!user.twoFactorEnabled)
      return res.status(400).json({ message: "2FA not enabled" });

    let verified = false;

    // 1️⃣ TOTP check
    if (token) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 2
      });
    }

    // 2️⃣ Backup code check
    if (!verified && backupCode) {
      const index = user.backupCodes.findIndex((c) =>
        bcrypt.compareSync(backupCode, c)
      );

      if (index !== -1) {
        verified = true;
        user.backupCodes.splice(index, 1);
        await user.save();
      }
    }

    if (!verified)
      return res.status(400).json({ message: "Invalid code" });

    // Issue login token finally
    const authToken = genToken(user._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login successful",
      user: sanitizeUser(user)
    });

  } catch (error) {
    logger.error("2FA login verification error", error.message);
    res.status(500).json({ message: "Login verification failed" });
  }
};

/* -----------------------------------------------------------
// FACE AUTH FUNCTIONS
----------------------------------------------------------- */

/**
 * Calculate Euclidean distance between two vectors
 */
const euclideanDistance = (a, b) => {
  if (a.length !== b.length) return Infinity;
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
};

/* -----------------------------------------------------------
// ENROLL FACE
----------------------------------------------------------- */
export const enrollFace = async (req, res) => {
  try {
    const { embeddings } = req.body;

    if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
      return res.status(400).json({ message: "Face embeddings are required" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store the embeddings (replace existing ones for simplicity)
    user.faceEmbeddings = [embeddings];
    user.faceAuthEnabled = true;
    await user.save();

    logger.info("Face enrolled for user", user._id);

    res.json({ message: "Face enrolled successfully" });

  } catch (error) {
    logger.error("Face enrollment error", error.message);
    res.status(500).json({ message: "Face enrollment failed" });
  }
};

/* -----------------------------------------------------------
// VERIFY FACE
----------------------------------------------------------- */
export const verifyFace = async (req, res) => {
  try {
    const { embeddings } = req.body;

    if (!embeddings || !Array.isArray(embeddings)) {
      return res.status(400).json({ message: "Face embeddings are required" });
    }

    const user = await User.findById(req.userId).select("+faceEmbeddings +faceAuthEnabled");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.faceAuthEnabled || !user.faceEmbeddings || user.faceEmbeddings.length === 0) {
      return res.status(400).json({ message: "Face authentication not enabled" });
    }

    // Compare with stored embeddings
    let minDistance = Infinity;
    for (const storedEmbedding of user.faceEmbeddings) {
      const distance = euclideanDistance(embeddings, storedEmbedding);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // Threshold for match (adjust as needed, lower is stricter)
    const threshold = 0.6;

    if (minDistance <= threshold) {
      res.json({ verified: true, message: "Face verified successfully" });
    } else {
      res.json({ verified: false, message: "Face verification failed" });
    }

  } catch (error) {
    logger.error("Face verification error", error.message);
    res.status(500).json({ message: "Face verification failed" });
  }
};

/* -----------------------------------------------------------
// VERIFY LOGIN FACE (final login step)
----------------------------------------------------------- */
export const verifyLoginFace = async (req, res) => {
  try {
    const { embeddings } = req.body;

    if (!embeddings || !Array.isArray(embeddings)) {
      return res.status(400).json({ message: "Face embeddings are required" });
    }

    const user = await User.findById(req.userId).select("+faceEmbeddings +faceAuthEnabled");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.faceAuthEnabled || !user.faceEmbeddings || user.faceEmbeddings.length === 0) {
      return res.status(400).json({ message: "Face authentication not enabled" });
    }

    // Compare with stored embeddings
    let minDistance = Infinity;
    for (const storedEmbedding of user.faceEmbeddings) {
      const distance = euclideanDistance(embeddings, storedEmbedding);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // Threshold for match
    const threshold = 0.6;

    if (minDistance > threshold) {
      return res.status(400).json({ message: "Face verification failed" });
    }

    // Issue login token finally
    const authToken = genToken(user._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login successful",
      user: sanitizeUser(user)
    });

  } catch (error) {
    logger.error("Face login verification error", error.message);
    res.status(500).json({ message: "Login verification failed" });
  }
};

/* -----------------------------------------------------------
// TOGGLE FACE AUTH
----------------------------------------------------------- */
export const toggleFaceAuth = async (req, res) => {
  try {
    const { enabled } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.faceAuthEnabled = enabled;
    if (!enabled) {
      user.faceEmbeddings = [];
    }
    await user.save();

    res.json({ message: `Face authentication ${enabled ? 'enabled' : 'disabled'}` });

  } catch (error) {
    logger.error("Toggle face auth error", error.message);
    res.status(500).json({ message: "Failed to toggle face authentication" });
  }
};
