import express from 'express';
import { convertUnits, getSupportedConversions } from '../controllers/unitConversion.controller.js';

const router = express.Router();

// Unit conversion routes
router.get('/convert', convertUnits);
router.get('/supported', getSupportedConversions);

export default router;
