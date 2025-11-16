import express from 'express';
import { getWeather, getWeatherForecast } from '../controllers/weather.controller.js';

const router = express.Router();

// Weather routes
router.get('/current', getWeather);
router.get('/forecast', getWeatherForecast);

export default router;
