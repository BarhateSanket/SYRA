import express from "express";
import {
  getDefinition,
  checkSpelling
} from "../controllers/dictionary.controller.js";

const router = express.Router();

// Get word definition
router.get("/define/:word", getDefinition);

// Check word spelling
router.get("/spell/:word", checkSpelling);

export default router;