import express from "express";

import {
  convertCurrency,
  getExchangeRates,
  getSupportedCurrencies
} from "../controllers/currency.controller.js";

const router = express.Router();

router.get("/convert", convertCurrency);
router.get("/rates", getExchangeRates);
router.get("/supported", getSupportedCurrencies);

export default router;
