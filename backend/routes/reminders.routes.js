import express from "express";
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  markCompleted
} from "../controllers/reminders.controller.js";

import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// All reminder routes require authentication
router.use(isAuth);

// Reminder routes
router.post("/", createReminder);
router.get("/", getReminders);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.patch("/:id/complete", markCompleted);

// IMPORTANT for ES module import in index.js
export default router;
