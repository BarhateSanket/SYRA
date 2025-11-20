import express from "express";
import { Login, logOut, signUp, enrollFace, verifyFace, toggleFaceAuth, verifyLoginFace } from "../controllers/auth.controller.js";
import isAuth from "../middlewares/isAuth.js";

const authRouter = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
authRouter.post("/signup", signUp);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Authenticate user login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/signin", Login);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Clear authentication cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.get("/logout", logOut);

/**
 * @swagger
 * /api/auth/enroll-face:
 *   post:
 *     summary: Enroll face for authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - embeddings
 *             properties:
 *               embeddings:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Face enrolled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
authRouter.post("/enroll-face", isAuth, enrollFace);

/**
 * @swagger
 * /api/auth/verify-face:
 *   post:
 *     summary: Verify face for authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - embeddings
 *             properties:
 *               embeddings:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Face verification result
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
authRouter.post("/verify-face", verifyFace);

/**
 * @swagger
 * /api/auth/toggle-face-auth:
 *   post:
 *     summary: Enable or disable face authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Face auth toggled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
authRouter.post("/toggle-face-auth", isAuth, toggleFaceAuth);

/**
 * @swagger
 * /api/auth/verify-login-face:
 *   post:
 *     summary: Verify face for login completion
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - embeddings
 *             properties:
 *               embeddings:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request or verification failed
 *       401:
 *         description: Unauthorized
 */
authRouter.post("/verify-login-face", isAuth, verifyLoginFace);

export default authRouter;
