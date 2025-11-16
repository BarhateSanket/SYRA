const Reminder = require('../models/reminder.model');
const cron = require('node-cron');
const { getGeminiResponse } = require('../gemini');

const createReminder = async (req, res) => {
  try {
    const { title, description, type, scheduledTime, isRecurring, recurrencePattern } = req.body;
    const userId = req.user.id;

    if (!title || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Title and scheduled time are required',
        data: null
      });
    }

    const reminder = new Reminder({
      userId,
      title,
      description,
      type: type || 'reminder',
      scheduledTime: new Date(scheduledTime),
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined
    });

    await reminder.save();

    // Schedule the reminder if it's not recurring or if it's the first occurrence
    if (!isRecurring) {
      scheduleReminder(reminder);
    } else {
      scheduleRecurringReminder(reminder);
    }

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });

  } catch (error) {
    console.error('Create reminder error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to create reminder',
      data: null
    });
  }
};

const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, isActive = true, limit = 50 } = req.query;

    const query = { userId, isActive: isActive === 'true' };

    if (type) {
      query.type = type;
    }

    const reminders = await Reminder.find(query)
      .sort({ scheduledTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Reminders retrieved successfully',
      data: reminders
    });

  } catch (error) {
    console.error('Get reminders error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reminders',
      data: null
    });
  }
};

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
        message: 'Reminder not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder
    });

  } catch (error) {
    console.error('Update reminder error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to update reminder',
      data: null
    });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
      data: reminder
    });

  } catch (error) {
    console.error('Delete reminder error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder',
      data: null
    });
  }
};

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
        message: 'Reminder not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder
    });

  } catch (error) {
    console.error('Mark completed error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to mark reminder as completed',
      data: null
    });
  }
};

// Helper function to schedule a one-time reminder
function scheduleReminder(reminder) {
  const now = new Date();
  const scheduledTime = new Date(reminder.scheduledTime);

  if (scheduledTime <= now) {
    // If the time has already passed, trigger immediately
    triggerReminder(reminder);
    return;
  }

  const delay = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    triggerReminder(reminder);
  }, delay);
}

// Helper function to schedule recurring reminders
function scheduleRecurringReminder(reminder) {
  const cronExpression = getCronExpression(reminder.recurrencePattern, reminder.scheduledTime);

  if (!cronExpression) {
    console.error('Invalid recurrence pattern for reminder:', reminder._id);
    return;
  }

  cron.schedule(cronExpression, () => {
    triggerReminder(reminder);
  });
}

// Helper function to get cron expression for recurring reminders
function getCronExpression(pattern, scheduledTime) {
  const minute = scheduledTime.getMinutes();
  const hour = scheduledTime.getHours();
  const day = scheduledTime.getDate();
  const month = scheduledTime.getMonth() + 1;
  const dayOfWeek = scheduledTime.getDay();

  switch (pattern) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${dayOfWeek}`;
    case 'monthly':
      return `${minute} ${hour} ${day} * *`;
    case 'yearly':
      return `${minute} ${hour} ${day} ${month} *`;
    default:
      return null;
  }
}

// Helper function to trigger a reminder
async function triggerReminder(reminder) {
  try {
    // Here you would integrate with your notification system
    // For now, we'll use Gemini to generate a reminder message
    const prompt = `Generate a friendly reminder message for: "${reminder.title}"${reminder.description ? ` - ${reminder.description}` : ''}`;

    const geminiResponse = await getGeminiResponse(prompt);

    // In a real implementation, you would send this to the user's device
    // For now, we'll log it and potentially store it
    console.log(`Reminder triggered for user ${reminder.userId}: ${geminiResponse.response}`);

    // If it's not recurring, mark as completed
    if (!reminder.isRecurring) {
      await Reminder.findByIdAndUpdate(reminder._id, {
        isCompleted: true,
        isActive: false
      });
    }

  } catch (error) {
    console.error('Error triggering reminder:', error);
  }
}

// Initialize existing reminders on server start
const initializeReminders = async () => {
  try {
    const activeReminders = await Reminder.find({ isActive: true });

    activeReminders.forEach(reminder => {
      if (!reminder.isRecurring) {
        const now = new Date();
        const scheduledTime = new Date(reminder.scheduledTime);

        if (scheduledTime > now) {
          scheduleReminder(reminder);
        }
      } else {
        scheduleRecurringReminder(reminder);
      }
    });

    console.log(`Initialized ${activeReminders.length} active reminders`);
  } catch (error) {
    console.error('Error initializing reminders:', error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  markCompleted,
  initializeReminders
};
