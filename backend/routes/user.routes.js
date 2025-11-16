import express from "express";

import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
  contactForm,
  getAnalytics,
  updateVoiceTraining,
  exportConversation
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

/**
 * @swagger
 * /api/user/current:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/current", isAuth, getCurrentUser);

/**
 * @swagger
 * /api/user/update:
 *   post:
 *     summary: Update assistant settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               assistantName:
 *                 type: string
 *               assistantImage:
 *                 type: string
 *                 format: binary
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assistant updated successfully
 */
userRouter.post(
  "/update",
  isAuth,
  upload.single("assistantImage"),
  updateAssistant
);

/**
 * @swagger
 * /api/user/asktoassistant:
 *   post:
 *     summary: Send command to AI assistant
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *     responses:
 *       200:
 *         description: Command processed
 */
userRouter.post("/asktoassistant", isAuth, askToAssistant);

/**
 * @swagger
 * /api/user/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *     responses:
 *       200:
 *         description: Message sent
 */
userRouter.post("/contact", contactForm);

/**
 * @swagger
 * /api/user/analytics:
 *   get:
 *     summary: Get analytics (Premium only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.get("/analytics", isAuth, getAnalytics);

/**
 * @swagger
 * /api/user/voice-training:
 *   post:
 *     summary: Update voice training
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.post("/voice-training", isAuth, updateVoiceTraining);

/**
 * @swagger
 * /api/user/export-conversation:
 *   post:
 *     summary: Export user conversation history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.post("/export-conversation", isAuth, exportConversation);

/* -------------------- PAYMENT / SUBSCRIPTIONS -------------------- */

/**
 * @swagger
 * /api/user/subscription:
 *   post:
 *     summary: Create subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planType
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [monthly, yearly]
 */
userRouter.post("/subscription", isAuth, createSubscription);

/**
 * @swagger
 * /api/user/subscription:
 *   get:
 *     summary: Get current subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.get("/subscription", isAuth, getSubscription);

/**
 * @swagger
 * /api/user/subscription/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.post("/subscription/cancel", isAuth, cancelSubscription);

/**
 * @swagger
 * /api/user/billing-history:
 *   get:
 *     summary: Get billing/payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
userRouter.get("/billing-history", isAuth, getBillingHistory);

/**
 * @swagger
 * /api/user/invoice/{paymentId}:
 *   post:
 *     summary: Generate invoice
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 */
userRouter.post("/invoice/:paymentId", isAuth, generateInvoice);

/**
 * @swagger
 * /api/user/webhook:
 *   post:
 *     summary: Handle Razorpay webhook
 *     tags: [Payment]
 */
userRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

export default userRouter;
