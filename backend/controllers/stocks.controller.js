import axios from 'axios';
import { ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL, YAHOO_FINANCE_BASE_URL } from '../config/stocks.js';

const getStockQuote = async (req, res) => {
  try {
    const { symbol = 'AAPL' } = req.query;

    if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'your_alpha_vantage_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Stock API key not configured',
        data: null
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const quote = response.data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock symbol not found',
        data: null
      });
    }

    const stockData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']),
      marketCap: null, // Would need additional API call
      peRatio: null, // Would need additional API call
      dividendYield: null // Would need additional API call
    };

    res.json({
      success: true,
      message: `Stock quote for ${symbol.toUpperCase()}`,
      data: stockData
    });

  } catch (error) {
    console.error('Stock API error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Stock API key',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock data',
      data: null
    });
  }
};

const getStockOverview = async (req, res) => {
  try {
    const { symbol = 'AAPL' } = req.query;

    if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'your_alpha_vantage_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Stock API key not configured',
        data: null
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock overview not found',
        data: null
      });
    }

    const overviewData = {
      symbol: response.data.Symbol,
      name: response.data.Name,
      description: response.data.Description,
      exchange: response.data.Exchange,
      currency: response.data.Currency,
      country: response.data.Country,
      sector: response.data.Sector,
      industry: response.data.Industry,
      marketCap: response.data.MarketCapitalization ? parseFloat(response.data.MarketCapitalization) : null,
      peRatio: response.data.PERatio ? parseFloat(response.data.PERatio) : null,
      pegRatio: response.data.PEGRatio ? parseFloat(response.data.PEGRatio) : null,
      dividendYield: response.data.DividendYield ? parseFloat(response.data.DividendYield) : null,
      dividendDate: response.data.DividendDate,
      exDividendDate: response.data.ExDividendDate,
      analystTargetPrice: response.data.AnalystTargetPrice ? parseFloat(response.data.AnalystTargetPrice) : null,
      beta: response.data.Beta ? parseFloat(response.data.Beta) : null,
      bookValue: response.data.BookValue ? parseFloat(response.data.BookValue) : null,
      eps: response.data.EPS ? parseFloat(response.data.EPS) : null,
      profitMargin: response.data.ProfitMargin ? parseFloat(response.data.ProfitMargin) : null,
      operatingMargin: response.data.OperatingMarginTTM ? parseFloat(response.data.OperatingMarginTTM) : null,
      returnOnAssets: response.data.ReturnOnAssetsTTM ? parseFloat(response.data.ReturnOnAssetsTTM) : null,
      returnOnEquity: response.data.ReturnOnEquityTTM ? parseFloat(response.data.ReturnOnEquityTTM) : null,
      revenue: response.data.RevenueTTM ? parseFloat(response.data.RevenueTTM) : null,
      grossProfit: response.data.GrossProfitTTM ? parseFloat(response.data.GrossProfitTTM) : null,
      quarterlyEarningsGrowth: response.data.QuarterlyEarningsGrowthYOY ? parseFloat(response.data.QuarterlyEarningsGrowthYOY) : null,
      quarterlyRevenueGrowth: response.data.QuarterlyRevenueGrowthYOY ? parseFloat(response.data.QuarterlyRevenueGrowthYOY) : null,
      analystRating: {
        strongBuy: response.data.AnalystRatingStrongBuy ? parseInt(response.data.AnalystRatingStrongBuy) : null,
        buy: response.data.AnalystRatingBuy ? parseInt(response.data.AnalystRatingBuy) : null,
        hold: response.data.AnalystRatingHold ? parseInt(response.data.AnalystRatingHold) : null,
        sell: response.data.AnalystRatingSell ? parseInt(response.data.AnalystRatingSell) : null,
        strongSell: response.data.AnalystRatingStrongSell ? parseInt(response.data.AnalystRatingStrongSell) : null
      }
    };

    res.json({
      success: true,
      message: `Stock overview for ${symbol.toUpperCase()}`,
      data: overviewData
    });

  } catch (error) {
    console.error('Stock overview API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock overview',
      data: null
    });
  }
};

const getStockTimeSeries = async (req, res) => {
  try {
    const { symbol = 'AAPL', interval = '5min', outputsize = 'compact' } = req.query;

    if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'your_alpha_vantage_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Stock API key not configured',
        data: null
      });
    }

    const functionName = interval === 'daily' ? 'TIME_SERIES_DAILY' :
                        interval === 'weekly' ? 'TIME_SERIES_WEEKLY' :
                        interval === 'monthly' ? 'TIME_SERIES_MONTHLY' :
                        'TIME_SERIES_INTRADAY';

    const params = {
      function: functionName,
      symbol: symbol.toUpperCase(),
      apikey: ALPHA_VANTAGE_API_KEY,
      outputsize
    };

    if (functionName === 'TIME_SERIES_INTRADAY') {
      params.interval = interval;
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, { params });

    const timeSeriesKey = interval === 'daily' ? 'Time Series (Daily)' :
                         interval === 'weekly' ? 'Weekly Time Series' :
                         interval === 'monthly' ? 'Monthly Time Series' :
                         `Time Series (${interval})`;

    const timeSeries = response.data[timeSeriesKey];

    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        message: 'Time series data not found',
        data: null
      });
    }

    const formattedData = Object.entries(timeSeries).map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      message: `${interval} time series for ${symbol.toUpperCase()}`,
      data: {
        symbol: symbol.toUpperCase(),
        interval,
        data: formattedData
      }
    });

  } catch (error) {
    console.error('Stock time series API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock time series',
      data: null
    });
  }
};

export {
  getStockQuote,
  getStockOverview,
  getStockTimeSeries
};
