import express from 'express';
const router = express.Router();
import youtubeDownloaderController from '../controllers/youtubeDownloader.controller.js';
import rateLimit from 'express-rate-limit';
import rateLimiter from '../middlewares/rateLimiter.js';
import isAuth from '../middlewares/isAuth.js';
import isPremium from '../middlewares/isPremium.js';

// Apply authentication and premium check to all routes
router.use(isAuth);
router.use(isPremium);

// Apply stricter rate limiting for downloads (max 5 downloads per hour per user)
const downloadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 downloads per hour
  message: 'Download limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId // Rate limit per user
});

// Get video information and available formats
router.get('/info', rateLimiter, youtubeDownloaderController.getVideoInfo);

// Start download
router.post('/download', downloadRateLimit, youtubeDownloaderController.startDownload);

// Get download status
router.get('/status/:downloadId', rateLimiter, youtubeDownloaderController.getDownloadStatus);

// Download completed file
router.get('/file/:downloadId', rateLimiter, youtubeDownloaderController.downloadFile);

// Get download history
router.get('/history', rateLimiter, youtubeDownloaderController.getDownloadHistory);

// Cancel download
router.delete('/cancel/:downloadId', rateLimiter, youtubeDownloaderController.cancelDownload);

export default router;