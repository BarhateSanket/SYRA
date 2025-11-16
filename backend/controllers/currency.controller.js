const axios = require("axios");
const {
  EXCHANGE_RATE_API_KEY,
  EXCHANGE_RATE_BASE_URL
} = require("../config/currency.js");

// Convert Currency
const convertCurrency = async (req, res) => {
  try {
    const { from = "USD", to = "EUR", amount = 1 } = req.query;

    if (
      !EXCHANGE_RATE_API_KEY ||
      EXCHANGE_RATE_API_KEY === "your_exchange_rate_api_key_here"
    ) {
      return res.status(500).json({
        success: false,
        message: "Currency API key not configured",
        data: null,
      });
    }

    const url = `${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/pair/${from.toUpperCase()}/${to.toUpperCase()}/${amount}`;
    const response = await axios.get(url);

    if (response.data.result === "error") {
      return res.status(400).json({
        success: false,
        message: response.data["error-type"] || "Invalid currency conversion request",
        data: null,
      });
    }

    const conversionData = {
      from: response.data.base_code,
      to: response.data.target_code,
      amount: parseFloat(amount),
      rate: response.data.conversion_rate,
      result: response.data.conversion_result,
      lastUpdate: new Date(response.data.time_last_update_unix * 1000).toISOString(),
      nextUpdate: new Date(response.data.time_next_update_unix * 1000).toISOString(),
    };

    res.json({
      success: true,
      message: `Converted ${amount} ${from.toUpperCase()} to ${to.toUpperCase()}`,
      data: conversionData,
    });
  } catch (error) {
    console.error("Currency API Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to convert currency",
      data: null,
    });
  }
};

// Get Exchange Rates
const getExchangeRates = async (req, res) => {
  try {
    const { base = "USD" } = req.query;

    if (
      !EXCHANGE_RATE_API_KEY ||
      EXCHANGE_RATE_API_KEY === "your_exchange_rate_api_key_here"
    ) {
      return res.status(500).json({
        success: false,
        message: "Currency API key not configured",
        data: null,
      });
    }

    const url = `${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/${base.toUpperCase()}`;
    const response = await axios.get(url);

    if (response.data.result === "error") {
      return res.status(400).json({
        success: false,
        message: response.data["error-type"] || "Invalid base currency",
        data: null,
      });
    }

    const ratesData = {
      base: response.data.base_code,
      rates: response.data.conversion_rates,
      lastUpdate: new Date(response.data.time_last_update_unix * 1000).toISOString(),
      nextUpdate: new Date(response.data.time_next_update_unix * 1000).toISOString(),
    };

    res.json({
      success: true,
      message: `Exchange rates for ${base.toUpperCase()}`,
      data: ratesData,
    });
  } catch (error) {
    console.error("Exchange Rates API Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exchange rates",
      data: null,
    });
  }
};

// Get Supported Currencies
const getSupportedCurrencies = async (req, res) => {
  try {
    if (
      !EXCHANGE_RATE_API_KEY ||
      EXCHANGE_RATE_API_KEY === "your_exchange_rate_api_key_here"
    ) {
      return res.status(500).json({
        success: false,
        message: "Currency API key not configured",
        data: null,
      });
    }

    const url = `${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/codes`;
    const response = await axios.get(url);

    if (response.data.result === "error") {
      return res.status(500).json({
        success: false,
        message:
          response.data["error-type"] || "Failed to fetch supported currencies",
        data: null,
      });
    }

    const currenciesData = response.data.supported_codes.map(([code, name]) => ({
      code,
      name,
    }));

    res.json({
      success: true,
      message: "Supported currencies fetched successfully",
      data: currenciesData,
    });
  } catch (error) {
    console.error(
      "Supported Currencies API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch supported currencies",
      data: null,
    });
  }
};

module.exports = {
  convertCurrency,
  getExchangeRates,
  getSupportedCurrencies,
};
