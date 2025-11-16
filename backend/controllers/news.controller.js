import axios from 'axios';
import { NEWS_API_KEY, NEWS_BASE_URL } from '../config/news.js';

const getNews = async (req, res) => {
  try {
    const {
      category = 'general',
      country = 'us',
      sources = '',
      q = '',
      pageSize = 10,
      page = 1
    } = req.query;

    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
      return res.status(500).json({
        success: false,
        message: 'News API key not configured',
        data: null
      });
    }

    let params = {
      apiKey: NEWS_API_KEY,
      pageSize: Math.min(parseInt(pageSize), 100),
      page: parseInt(page)
    };

    let endpoint = 'top-headlines';

    if (sources) {
      // If specific sources are requested
      params.sources = sources;
    } else if (q) {
      // If searching for specific query
      endpoint = 'everything';
      params.q = q;
      params.sortBy = 'publishedAt';
    } else {
      // Default: top headlines by category/country
      params.category = category;
      params.country = country;
    }

    const response = await axios.get(`${NEWS_BASE_URL}/${endpoint}`, { params });

    const newsData = {
      totalResults: response.data.totalResults,
      articles: response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source.id,
          name: article.source.name
        },
        author: article.author
      }))
    };

    res.json({
      success: true,
      message: `News articles fetched successfully`,
      data: newsData
    });

  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid News API key',
        data: null
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'News API rate limit exceeded',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      data: null
    });
  }
};

const getNewsSources = async (req, res) => {
  try {
    const { category = '', language = 'en', country = '' } = req.query;

    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
      return res.status(500).json({
        success: false,
        message: 'News API key not configured',
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

    const sourcesData = {
      sources: response.data.sources.map(source => ({
        id: source.id,
        name: source.name,
        description: source.description,
        url: source.url,
        category: source.category,
        language: source.language,
        country: source.country
      }))
    };

    res.json({
      success: true,
      message: 'News sources fetched successfully',
      data: sourcesData
    });

  } catch (error) {
    console.error('News sources API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch news sources',
      data: null
    });
  }
};

export {
  getNews,
  getNewsSources
};
