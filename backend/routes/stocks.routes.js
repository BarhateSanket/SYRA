import express from "express";
import {
  getStockQuote,
  getStockOverview,
  getStockTimeSeries
} from "../controllers/stocks.controller.js";

const router = express.Router();

// Stock Routes
router.get("/quote", getStockQuote);
router.get("/overview", getStockOverview);
router.get("/timeseries", getStockTimeSeries);

export default router;
