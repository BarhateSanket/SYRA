import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["reminder", "alarm"],
      default: "reminder",
    },

    scheduledTime: {
      type: Date,
      required: true,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: function () {
        return this.isRecurring;
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
reminderSchema.index({ userId: 1, scheduledTime: 1 });
reminderSchema.index({ scheduledTime: 1, isActive: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
