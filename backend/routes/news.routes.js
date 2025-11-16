import express from 'express';
import { getNews, getNewsSources } from '../controllers/news.controller.js';

const router = express.Router();

// News routes
router.get('/', getNews);
router.get('/sources', getNewsSources);

export default router;
