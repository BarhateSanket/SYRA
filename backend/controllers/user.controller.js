import uploadOnCloudinary from "../config/cloudinary.js";
import getGeminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/* ============================================================
   GET CURRENT USER
============================================================ */
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json(null);
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(200).json(null);
    }

    if (!payload.userId || !mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(200).json(null);
    }

    const user = await User.findById(payload.userId)
      .select("-password")
      .populate("currentSubscription");

    if (!user) {
      return res.status(200).json(null);
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "Get current user error" });
  }
};

/* ============================================================
   UPDATE ASSISTANT PROFILE
============================================================ */
export const updateAssistant = async (req, res) => {
    try {
      const { assistantName, imageUrl } = req.body;

      const updateData = { assistantName };

      if (req.file) {
        try {
          updateData.assistantImage = await uploadOnCloudinary(req.file.path);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError.message);
          // Continue without image if upload fails
          // Optionally set a default image or leave as is
        }
      } else if (imageUrl) {
        updateData.assistantImage = imageUrl;
      }

      const user = await User.findByIdAndUpdate(req.userId, updateData, {
        new: true
      }).select("-password");

      return res.status(200).json(user);
    } catch (error) {
      console.error("Update Assistant Error:", error.message);
      console.error("Error stack:", error.stack);
      return res.status(400).json({ message: "updateAssistantError", details: error.message });
    }
  };

/* ============================================================
   CONTACT FORM
============================================================ */
export const contactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const user = await User.findById(req.userId);
    const isPrioritySupport = user?.premiumFeatures?.prioritySupport || false;

    return res.status(200).json({
      success: true,
      message: isPrioritySupport
        ? "Priority support request submitted. We’ll respond within 2 hours."
        : "Message sent successfully",
      data: { name, email, subject },
      prioritySupport: isPrioritySupport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

/* ============================================================
   USER ANALYTICS (PREMIUM)
============================================================ */
export const getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.premiumFeatures?.advancedAnalytics) {
      return res.status(403).json({
        message: "Advanced analytics is a premium feature",
        upgradeRequired: true
      });
    }

    const history = user.history || [];
    const totalCommands = history.length;

    const commandTypes = {
      general: history.filter(
        (h) =>
          !h.command?.toLowerCase().includes("open") &&
          !h.command?.toLowerCase().includes("search")
      ).length,
      search: history.filter((h) =>
        h.command?.toLowerCase().includes("search")
      ).length,
      open: history.filter((h) => h.command?.toLowerCase().includes("open"))
        .length
    };

    const last30 = moment().subtract(30, "days").toDate();
    const recent = history.filter((h) => new Date(h.timestamp) >= last30);

    const dailyUsage = {};
    recent.forEach((h) => {
      const date = new Date(h.timestamp).toDateString();
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });

    return res.status(200).json({
      totalCommands,
      commandTypes,
      dailyUsage: Object.entries(dailyUsage).map(([date, count]) => ({
        date,
        count
      })),
      averageCommandsPerDay: totalCommands / 30,
      mostActiveDay: Object.entries(dailyUsage).reduce(
        (max, [date, count]) =>
          count > max.count ? { date, count } : max,
        { date: "", count: 0 }
      )
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

/* ============================================================
   VOICE TRAINING (PREMIUM)
============================================================ */
export const updateVoiceTraining = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.premiumFeatures?.customVoiceTraining) {
      return res.status(403).json({
        message: "Custom voice training is a premium feature",
        upgradeRequired: true
      });
    }

    const { voicePreferences, customCommands } = req.body;

    const updateData = {};
    updateData.voiceTraining = {};

    if (voicePreferences) updateData.voiceTraining.preferences = voicePreferences;
    if (customCommands) updateData.voiceTraining.customCommands = customCommands;

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true
    }).select("-password");

    return res.status(200).json({
      message: "Voice training updated successfully",
      voiceTraining: updatedUser.voiceTraining
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update voice training" });
  }
};

/* ============================================================
   EXPORT CONVERSATION (PREMIUM)
============================================================ */
export const exportConversation = async (req, res) => {
  try {
    const { format = "json", dateRange } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.premiumFeatures?.advancedAnalytics) {
      return res.status(403).json({
        message: "Conversation export is a premium feature",
        upgradeRequired: true
      });
    }

    let history = [...(user.history || [])];

    if (dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      history = history.filter((h) => {
        const ts = new Date(h.timestamp);
        return ts >= start && ts <= end;
      });
    }

    if (format === "csv") {
      const csv = history.map((item, index) => ({
        id: index + 1,
        command: typeof item === "string" ? item : item.command,
        timestamp: item.timestamp || new Date().toISOString(),
        type: "user_command"
      }));

      return res.status(200).json({
        format: "csv",
        data: csv,
        totalItems: csv.length
      });
    }

    return res.status(200).json({
      format: "json",
      data: history,
      totalItems: history.length,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to export conversation" });
  }
};

/* ============================================================
   ASK ASSISTANT → GEMINI
============================================================ */
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        type: "general",
        userInput: command,
        response: "Database connection issue. Please try again in a moment."
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.json({
        type: "general",
        userInput: command,
        response: "User session expired. Please refresh the page and try again."
      });
    }

    const isPremium =
      user.subscriptionStatus === "active" &&
      user.subscriptionPlan !== "free";

    const hasUnlimited = user.premiumFeatures?.unlimitedCommands || false;

    // FREE USER LIMITING
    if (!isPremium && !hasUnlimited) {
      const today = new Date().toDateString();
      const count = user.history.filter(
        (h) =>
          new Date(h.timestamp).toDateString() === today
      ).length;

      if (count >= 10) {
        return res.status(429).json({
          type: "general",
          userInput: command,
          response:
            "You have reached your daily limit. Upgrade to premium for unlimited commands!",
          limitReached: true
        });
      }
    }

    // Save command to history (don't fail the whole request if this fails)
    try {
      user.history.push({ command, timestamp: new Date() });
      await user.save();
    } catch (dbError) {
      console.error("Failed to save command history:", dbError.message);
      // Continue without saving history
    }

    const assistantName = user.assistantName;
    const userName = user.name;

    const result = await getGeminiResponse(command, assistantName, userName, {
      isPremium,
      isAdvancedAI: user.premiumFeatures?.advancedAI || false,
      conversationHistory: user.history.slice(-10),
      userLanguage: req.headers["accept-language"] || "en"
    });

    // Handle error responses from Gemini API
    if (result && result.error) {
      let errorMessage = "I'm facing technical issues. Try again soon.";

      switch (result.error) {
        case "missing_api_key":
          errorMessage = "AI service is not configured. Please contact support.";
          break;
        case "invalid_api_key":
          errorMessage = "AI service authentication failed. Please contact support.";
          break;
        case "rate_limit":
          errorMessage = "AI service is busy. Please wait a moment and try again.";
          break;
        case "server_error":
          errorMessage = "AI service is temporarily unavailable. Please try again later.";
          break;
        case "network_error":
          errorMessage = "Network connection issue. Please check your internet and try again.";
          break;
        case "invalid_request":
          errorMessage = "I couldn't process that request. Please try rephrasing.";
          break;
        case "empty_response":
          errorMessage = "I received an incomplete response. Please try again.";
          break;
      }

      return res.json({
        type: "general",
        userInput: command,
        response: errorMessage
      });
    }

    if (!result) {
      return res.json({
        type: "general",
        userInput: command,
        response: "I'm having trouble processing your request. Please try again."
      });
    }

    // Extract JSON
    const match = result.match(/{[\s\S]*}/);
    if (!match) {
      return res.json({
        type: "general",
        userInput: command,
        response: "I didn’t understand that. Try rephrasing."
      });
    }

    let gem;
    try {
      gem = JSON.parse(match[0]);
    } catch {
      return res.json({
        type: "general",
        userInput: command,
        response: "I'm having trouble understanding your request."
      });
    }

    const type = gem.type;

    // SPECIAL SYSTEM COMMANDS
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gem.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`
        });

      case "get-time":
        return res.json({
          type,
          userInput: gem.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`
        });

      case "get-day":
        return res.json({
          type,
          userInput: gem.userInput,
          response: `Today is ${moment().format("dddd")}`
        });

      case "get-month":
        return res.json({
          type,
          userInput: gem.userInput,
          response: `This month is ${moment().format("MMMM")}`
        });

      default:
        return res.json({
          type,
          userInput: gem.userInput,
          response: gem.response
        });
    }
  } catch (error) {
    console.error("Ask Assistant Error:", error.message);
    return res.json({
      type: "general",
      userInput: req.body.command || "unknown",
      response: "Server error occurred. Please try again."
    });
  }
};
