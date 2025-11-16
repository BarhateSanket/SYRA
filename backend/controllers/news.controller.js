import axios from "axios";
import { NEWS_API_KEY, NEWS_BASE_URL } from "../config/news.js";

/* ---------------------------------------------------------
   GET NEWS ARTICLES
--------------------------------------------------------- */
export const getNews = async (req, res) => {
  try {
    const {
      category = "general",
      country = "us",
      sources = "",
      q = "",
      pageSize = 10,
      page = 1
    } = req.query;

    if (!NEWS_API_KEY || NEWS_API_KEY === "your_newsapi_key_here") {
      return res.status(500).json({
        success: false,
        message: "News API key not configured",
        data: null
      });
    }

    const params = {
      apiKey: NEWS_API_KEY,
      pageSize: Math.min(Number(pageSize) || 10, 100),
      page: Number(page) || 1
    };

    let endpoint = "top-headlines";

    if (sources) {
      params.sources = sources;
    } else if (q) {
      endpoint = "everything";
      params.q = q;
      params.sortBy = "publishedAt";
    } else {
      params.category = category;
      params.country = country;
    }

    const response = await axios.get(`${NEWS_BASE_URL}/${endpoint}`, { params });

    const articles = Array.isArray(response.data.articles)
      ? response.data.articles.map((article) => ({
          title: article.title || "",
          description: article.description || "",
          content: article.content || "",
          url: article.url || "",
          urlToImage: article.urlToImage || "",
          publishedAt: article.publishedAt || "",
          author: article.author || "Unknown",
          source: {
            id: article.source?.id || null,
            name: article.source?.name || "Unknown"
          }
        }))
      : [];

    res.json({
      success: true,
      message: "News articles fetched successfully",
      data: {
        totalResults: response.data.totalResults || articles.length,
        articles
      }
    });
  } catch (error) {
    console.error("News API error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid News API key",
        data: null
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "News API rate limit exceeded",
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      data: null
    });
  }
};

/* ---------------------------------------------------------
   GET NEWS SOURCES
--------------------------------------------------------- */
export const getNewsSources = async (req, res) => {
  try {
    const { category = "", language = "en", country = "" } = req.query;

    if (!NEWS_API_KEY || NEWS_API_KEY === "your_newsapi_key_here") {
      return res.status(500).json({
        success: false,
        message: "News API key not configured",
        data: null
      });
    }

    const params = {
      apiKey: NEWS_API_KEY,
      language
    };

    if (category) params.category = category;
    if (country) params.country = country;

    const response = await axios.get(`${NEWS_BASE_URL}/sources`, { params });

    const sources = Array.isArray(response.data.sources)
      ? response.data.sources.map((src) => ({
          id: src.id || "",
          name: src.name || "",
          description: src.description || "",
          url: src.url || "",
          category: src.category || "",
          language: src.language || "",
          country: src.country || ""
        }))
      : [];

    res.json({
      success: true,
      message: "News sources fetched successfully",
      data: { sources }
    });
  } catch (error) {
    console.error("News sources API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news sources",
      data: null
    });
  }
};
