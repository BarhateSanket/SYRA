import express from "express";
import { getNews, getNewsSources } from "../controllers/news.controller.js";

const router = express.Router();

// News Routes
router.get("/", getNews);              // Fetch latest or searched news
router.get("/sources", getNewsSources); // Fetch available news sources

export default router;
