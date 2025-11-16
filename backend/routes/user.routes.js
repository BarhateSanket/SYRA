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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
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
 *                 description: Assistant name
 *               assistantImage:
 *                 type: string
 *                 format: binary
 *                 description: Assistant image file
 *               imageUrl:
 *                 type: string
 *                 description: Image URL (alternative to file upload)
 *     responses:
 *       200:
 *         description: Assistant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);

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
 *                 description: Voice command to process
 *     responses:
 *       200:
 *         description: Command processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Command type (youtube-search, etc.)
 *                 userInput:
 *                   type: string
 *                   description: Processed user input
 *                 response:
 *                   type: string
 *                   description: Assistant response
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/contact", contactForm);

/**
 * @swagger
 * /api/user/analytics:
 *   get:
 *     summary: Get user analytics
 *     tags: [User, Analytics]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/analytics", isAuth, getAnalytics);

/**
 * @swagger
 * /api/user/voice-training:
 *   post:
 *     summary: Update voice training data
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
 *             properties:
 *               trainingData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Voice training updated
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/voice-training", isAuth, updateVoiceTraining);

/**
 * @swagger
 * /api/user/export-conversation:
 *   post:
 *     summary: Export conversation history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [json, csv, txt]
 *                 default: json
 *     responses:
 *       200:
 *         description: Conversation exported
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/export-conversation", isAuth, exportConversation);

// Payment & Subscription routes
/**
 * @swagger
 * /api/user/subscription:
 *   post:
 *     summary: Create new subscription
 *     tags: [Payment, Subscription]
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
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription created
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/subscription", isAuth, createSubscription);

/**
 * @swagger
 * /api/user/subscription:
 *   get:
 *     summary: Get current subscription
 *     tags: [Payment, Subscription]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Subscription data retrieved
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/subscription", isAuth, getSubscription);

/**
 * @swagger
 * /api/user/subscription/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Payment, Subscription]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/subscription/cancel", isAuth, cancelSubscription);

/**
 * @swagger
 * /api/user/billing-history:
 *   get:
 *     summary: Get billing history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Billing history retrieved
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: Invoice generated
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/invoice/:paymentId", isAuth, generateInvoice);

/**
 * @swagger
 * /api/user/webhook:
 *   post:
 *     summary: Handle payment webhook
 *     tags: [Payment]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
userRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default userRouter;
