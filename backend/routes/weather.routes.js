import express from "express";
import { 
  getWeather, 
  getWeatherForecast 
} from "../controllers/weather.controller.js";

const router = express.Router();

// Current weather
router.get("/current", getWeather);

// 5-day / multi-day weather forecast
router.get("/forecast", getWeatherForecast);

export default router;
