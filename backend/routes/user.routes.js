import express from "express";
import { 
  askToAssistant, 
  getCurrentUser, 
  updateAssistant, 
  contactForm 
} from "../controllers/user.controller.js";

import {
  createSubscription,
  getSubscription,
  cancelSubscription,
  getBillingHistory,
  generateInvoice,
  handleWebhook
} from "../controllers/payment.controller.js";

import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// Existing user routes
userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);
userRouter.post("/contact", contactForm);

// Payment & Subscription routes
userRouter.post("/subscription", isAuth, createSubscription);
userRouter.get("/subscription", isAuth, getSubscription);
userRouter.post("/subscription/cancel", isAuth, cancelSubscription);
userRouter.get("/billing-history", isAuth, getBillingHistory);
userRouter.post("/invoice/:paymentId", isAuth, generateInvoice);

// Webhook route (no auth required)
userRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default userRouter;
