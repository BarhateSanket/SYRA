const express = require("express");
const {
  convertCurrency,
  getExchangeRates,
  getSupportedCurrencies
} = require("../controllers/currency.controller.js");

const router = express.Router();

// Routes
router.get("/convert", convertCurrency);
router.get("/rates", getExchangeRates);
router.get("/supported", getSupportedCurrencies);

module.exports = router;
