import axios from "axios";
import {
  ALPHA_VANTAGE_API_KEY,
  ALPHA_VANTAGE_BASE_URL,
  YAHOO_FINANCE_BASE_URL
} from "../config/stocks.js";

/* ============================================================
   GET REAL-TIME STOCK QUOTE
============================================================ */
export const getStockQuote = async (req, res) => {
  try {
    const { symbol = "AAPL" } = req.query;

    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Stock API key not configured",
        data: null,
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const quote = response.data["Global Quote"];

    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock symbol not found",
        data: null,
      });
    }

    const stockData = {
      symbol: quote["01. symbol"],
      price: Number(quote["05. price"]),
      change: Number(quote["09. change"]),
      changePercent: quote["10. change percent"],
      volume: Number(quote["06. volume"]),
      previousClose: Number(quote["08. previous close"]),
      latestTradingDay: quote["07. latest trading day"],
      marketCap: null,
      peRatio: null,
      dividendYield: null,
    };

    res.json({
      success: true,
      message: `Stock quote for ${symbol.toUpperCase()}`,
      data: stockData,
    });
  } catch (error) {
    console.error("Stock API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock data",
      data: null,
    });
  }
};

/* ============================================================
   GET STOCK FUNDAMENTAL OVERVIEW
============================================================ */
export const getStockOverview = async (req, res) => {
  try {
    const { symbol = "AAPL" } = req.query;

    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Stock API key not configured",
        data: null,
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: "OVERVIEW",
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock overview not found",
        data: null,
      });
    }

    const d = response.data;

    const overviewData = {
      symbol: d.Symbol,
      name: d.Name,
      description: d.Description,
      exchange: d.Exchange,
      sector: d.Sector,
      industry: d.Industry,
      currency: d.Currency,
      country: d.Country,

      marketCap: d.MarketCapitalization ? Number(d.MarketCapitalization) : null,
      peRatio: d.PERatio ? Number(d.PERatio) : null,
      pegRatio: d.PEGRatio ? Number(d.PEGRatio) : null,
      dividendYield: d.DividendYield ? Number(d.DividendYield) : null,
      dividendDate: d.DividendDate,
      exDividendDate: d.ExDividendDate,

      analystTargetPrice: d.AnalystTargetPrice ? Number(d.AnalystTargetPrice) : null,
      beta: d.Beta ? Number(d.Beta) : null,
      bookValue: d.BookValue ? Number(d.BookValue) : null,
      eps: d.EPS ? Number(d.EPS) : null,

      revenue: d.RevenueTTM ? Number(d.RevenueTTM) : null,
      grossProfit: d.GrossProfitTTM ? Number(d.GrossProfitTTM) : null,

      profitMargin: d.ProfitMargin ? Number(d.ProfitMargin) : null,
      operatingMargin: d.OperatingMarginTTM ? Number(d.OperatingMarginTTM) : null,
      returnOnAssets: d.ReturnOnAssetsTTM ? Number(d.ReturnOnAssetsTTM) : null,
      returnOnEquity: d.ReturnOnEquityTTM ? Number(d.ReturnOnEquityTTM) : null,

      quarterlyEarningsGrowth: d.QuarterlyEarningsGrowthYOY
        ? Number(d.QuarterlyEarningsGrowthYOY)
        : null,

      quarterlyRevenueGrowth: d.QuarterlyRevenueGrowthYOY
        ? Number(d.QuarterlyRevenueGrowthYOY)
        : null,

      analystRating: {
        strongBuy: d.AnalystRatingStrongBuy ? Number(d.AnalystRatingStrongBuy) : null,
        buy: d.AnalystRatingBuy ? Number(d.AnalystRatingBuy) : null,
        hold: d.AnalystRatingHold ? Number(d.AnalystRatingHold) : null,
        sell: d.AnalystRatingSell ? Number(d.AnalystRatingSell) : null,
        strongSell: d.AnalystRatingStrongSell ? Number(d.AnalystRatingStrongSell) : null,
      },
    };

    res.json({
      success: true,
      message: `Stock overview for ${symbol.toUpperCase()}`,
      data: overviewData,
    });
  } catch (error) {
    console.error("Stock overview API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock overview",
      data: null,
    });
  }
};

/* ============================================================
   GET TIME-SERIES PRICE DATA (INTRADAY / DAILY / WEEKLY / MONTHLY)
============================================================ */
export const getStockTimeSeries = async (req, res) => {
  try {
    const { symbol = "AAPL", interval = "5min", outputsize = "compact" } = req.query;

    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Stock API key not configured",
        data: null,
      });
    }

    // Map interval → AlphaVantage functions
    const fn =
      interval === "daily"
        ? "TIME_SERIES_DAILY"
        : interval === "weekly"
        ? "TIME_SERIES_WEEKLY"
        : interval === "monthly"
        ? "TIME_SERIES_MONTHLY"
        : "TIME_SERIES_INTRADAY";

    const params = {
      function: fn,
      symbol: symbol.toUpperCase(),
      apikey: ALPHA_VANTAGE_API_KEY,
      outputsize,
    };

    if (fn === "TIME_SERIES_INTRADAY") params.interval = interval;

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, { params });

    // Detect correct time series key
    const key =
      interval === "daily"
        ? "Time Series (Daily)"
        : interval === "weekly"
        ? "Weekly Time Series"
        : interval === "monthly"
        ? "Monthly Time Series"
        : `Time Series (${interval})`;

    const series = response.data[key];

    if (!series) {
      return res.status(404).json({
        success: false,
        message: "Time series data not found",
        data: null,
      });
    }

    const formattedData = Object.entries(series)
      .map(([date, o]) => ({
        date,
        open: Number(o["1. open"]),
        high: Number(o["2. high"]),
        low: Number(o["3. low"]),
        close: Number(o["4. close"]),
        volume: Number(o["5. volume"]),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      message: `${interval} time series for ${symbol.toUpperCase()}`,
      data: {
        symbol: symbol.toUpperCase(),
        interval,
        data: formattedData,
      },
    });
  } catch (error) {
    console.error("Stock time series API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock time series",
      data: null,
    });
  }
};
