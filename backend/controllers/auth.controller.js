import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ===========================
// SIGNUP CONTROLLER
// ===========================
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing email
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = await genToken(user._id);

    // 🔥 Correct Cookie for Vercel + Render
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(201).json(user);

  } catch (error) {
    return res.status(500).json({ message: `Signup error: ${error}` });
  }
};



// ===========================
// LOGIN CONTROLLER
// ===========================
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist!" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    // Generate token
    const token = await genToken(user._id);

    // 🔥 Correct Cookie for cross-origin auth
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: `Login error: ${error}` });
  }
};



// ===========================
// LOGOUT CONTROLLER
// ===========================
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    return res.status(500).json({ message: `Logout error: ${error}` });
  }
};
