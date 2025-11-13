import express from "express";
import { 
  askToAssistant, 
  getCurrentUser, 
  updateAssistant, 
  contactForm 
} from "../controllers/user.controller.js";

import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

// Get logged-in user
userRouter.get("/current", isAuth, getCurrentUser);

// Update assistant (name + image upload)
userRouter.post(
  "/update",
  isAuth,
  upload.single("assistantImage"), 
  updateAssistant
);

// AI assistant interaction
userRouter.post("/asktoassistant", isAuth, askToAssistant);

// Contact form
userRouter.post("/contact", contactForm);

export default userRouter;
