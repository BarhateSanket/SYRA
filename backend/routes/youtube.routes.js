import express from 'express';
const router = express.Router();
import youtubeController from '../controllers/youtube.controller.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import { cacheMiddleware } from '../middlewares/cache.js';

// Apply rate limiting to YouTube routes
router.use(rateLimiter);

// Search videos
router.get('/search', cacheMiddleware(300), youtubeController.searchVideos); // Cache for 5 minutes

// Get video for playback (auto-play first result)
router.get('/play', cacheMiddleware(600), youtubeController.getVideoForPlayback); // Cache for 10 minutes

// Get trending videos
router.get('/trending', cacheMiddleware(1800), youtubeController.getTrendingVideos); // Cache for 30 minutes

export default router;
