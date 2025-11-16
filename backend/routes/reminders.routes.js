const express = require("express");
const {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  markCompleted
} = require("../controllers/reminders.controller.js");
const isAuth = require("../middlewares/isAuth.js");

const router = express.Router();

// All reminder routes require authentication
router.use(isAuth);

// Reminder routes
router.post("/", createReminder);
router.get("/", getReminders);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.patch("/:id/complete", markCompleted);

module.exports = router;
