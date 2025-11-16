import Reminder from "../models/reminder.model.js";
import cron from "node-cron";
import { getGeminiResponse } from "../gemini.js";

// ---------------- CREATE REMINDER ----------------
export const createReminder = async (req, res) => {
  try {
    const { title, description, type, scheduledTime, isRecurring, recurrencePattern } = req.body;
    const userId = req.user?.id;

    if (!title || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: "Title and scheduled time are required",
        data: null,
      });
    }

    const reminder = new Reminder({
      userId,
      title,
      description,
      type: type || "reminder",
      scheduledTime: new Date(scheduledTime),
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
    });

    await reminder.save();

    if (!isRecurring) scheduleReminder(reminder);
    else scheduleRecurringReminder(reminder);

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Create reminder error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create reminder" });
  }
};

// ---------------- GET REMINDERS ----------------
export const getReminders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type, isActive = true, limit = 50 } = req.query;

    const query = { userId, isActive: isActive === "true" };

    if (type) query.type = type;

    const reminders = await Reminder.find(query)
      .sort({ scheduledTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: "Reminders retrieved successfully",
      data: reminders,
    });
  } catch (error) {
    console.error("Get reminders error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve reminders" });
  }
};

// ---------------- UPDATE REMINDER ----------------
export const updateReminder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Update reminder error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update reminder" });
  }
};

// ---------------- DELETE REMINDER ----------------
export const deleteReminder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({
      success: true,
      message: "Reminder deleted successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Delete reminder error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete reminder" });
  }
};

// ---------------- MARK COMPLETED ----------------
export const markCompleted = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { isCompleted: true, isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({
      success: true,
      message: "Reminder marked as completed",
      data: reminder,
    });
  } catch (error) {
    console.error("Mark completed error:", error.message);
    res.status(500).json({ success: false, message: "Failed to mark reminder as completed" });
  }
};

// ======================================================
// ---------------- SCHEDULING HELPERS ------------------
// ======================================================

function scheduleReminder(reminder) {
  const now = new Date();
  const scheduled = new Date(reminder.scheduledTime);
  if (scheduled <= now) return triggerReminder(reminder);

  const delay = scheduled - now;

  setTimeout(() => triggerReminder(reminder), delay);
}

function scheduleRecurringReminder(reminder) {
  const cronExp = getCronExpression(reminder.recurrencePattern, reminder.scheduledTime);
  if (!cronExp) return;

  cron.schedule(cronExp, () => triggerReminder(reminder));
}

function getCronExpression(pattern, date) {
  const min = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();

  switch (pattern) {
    case "daily":
      return `${min} ${hour} * * *`;
    case "weekly":
      return `${min} ${hour} * * ${dow}`;
    case "monthly":
      return `${min} ${hour} ${day} * *`;
    case "yearly":
      return `${min} ${hour} ${day} ${month} *`;
    default:
      return null;
  }
}

async function triggerReminder(reminder) {
  try {
    const prompt = `Generate a friendly reminder message for: "${reminder.title}" ${
      reminder.description ? ` - ${reminder.description}` : ""
    }`;

    const ai = await getGeminiResponse(prompt);

    console.log(`Reminder triggered for user ${reminder.userId}: ${ai.response}`);

    if (!reminder.isRecurring) {
      await Reminder.findByIdAndUpdate(reminder._id, {
        isCompleted: true,
        isActive: false,
      });
    }
  } catch (error) {
    console.error("Error triggering reminder:", error);
  }
}

// ---------------- INITIALIZATION ----------------
export const initializeReminders = async () => {
  try {
    const active = await Reminder.find({ isActive: true });

    active.forEach((rem) => {
      if (!rem.isRecurring) {
        if (new Date(rem.scheduledTime) > new Date()) scheduleReminder(rem);
      } else {
        scheduleRecurringReminder(rem);
      }
    });

    console.log(`Initialized ${active.length} active reminders`);
  } catch (error) {
    console.error("Error initializing reminders:", error);
  }
};
