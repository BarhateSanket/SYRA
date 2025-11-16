const Reminder = require("../models/reminder.model");
const cron = require("node-cron");
const { getGeminiResponse } = require("../gemini");

// ---------------- CREATE REMINDER ----------------
const createReminder = async (req, res) => {
  try {
    const { title, description, type, scheduledTime, isRecurring, recurrencePattern } = req.body;
    const userId = req.user.id;

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

    // Schedule
    if (!isRecurring) scheduleReminder(reminder);
    else scheduleRecurringReminder(reminder);

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Create reminder error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create reminder",
      data: null,
    });
  }
};

// ---------------- GET REMINDERS ----------------
const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
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

    res.status(500).json({
      success: false,
      message: "Failed to retrieve reminders",
      data: null,
    });
  }
};

// ---------------- UPDATE REMINDER ----------------
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Update reminder error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update reminder",
      data: null,
    });
  }
};

// ---------------- DELETE REMINDER ----------------
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Reminder deleted successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("Delete reminder error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
      data: null,
    });
  }
};

// ---------------- MARK COMPLETED ----------------
const markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { isCompleted: true, isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Reminder marked as completed",
      data: reminder,
    });
  } catch (error) {
    console.error("Mark completed error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to mark reminder as completed",
      data: null,
    });
  }
};

// ======================================================
// ---------------- SCHEDULING HELPERS ------------------
// ======================================================

// ONE-TIME REMINDER
function scheduleReminder(reminder) {
  const now = new Date();
  const scheduled = new Date(reminder.scheduledTime);

  if (scheduled <= now) return triggerReminder(reminder);

  const delay = scheduled - now;

  setTimeout(() => {
    triggerReminder(reminder);
  }, delay);
}

// RECURRING REMINDER
function scheduleRecurringReminder(reminder) {
  const cronExp = getCronExpression(reminder.recurrencePattern, reminder.scheduledTime);
  if (!cronExp) {
    console.error("Invalid recurrence pattern:", reminder._id);
    return;
  }

  cron.schedule(cronExp, () => triggerReminder(reminder));
}

// CRON PATTERN BUILDER
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

// ---------------- TRIGGER REMINDER ----------------
async function triggerReminder(reminder) {
  try {
    const prompt = `Generate a friendly reminder message for: "${reminder.title}"${reminder.description ? ` - ${reminder.description}` : ""}`;

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
const initializeReminders = async () => {
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

// EXPORT
module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  markCompleted,
  initializeReminders,
};
