import axios from 'axios';
import youtubeConfig from '../config/youtube.js';
import logger from '../utils/logger.js';

class YouTubeController {
  // Search for videos
  async searchVideos(req, res) {
    try {
      const { query, maxResults = youtubeConfig.maxResults } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      if (!youtubeConfig.apiKey) {
        return res.status(500).json({
          success: false,
          message: 'YouTube API key not configured'
        });
      }

      const searchParams = {
        part: youtubeConfig.search.part,
        q: query,
        type: youtubeConfig.search.type,
        order: youtubeConfig.search.order,
        safeSearch: youtubeConfig.search.safeSearch,
        maxResults: Math.min(maxResults, 50), // API limit
        key: youtubeConfig.apiKey
      };

      const response = await axios.get(`${youtubeConfig.baseUrl}/search`, {
        params: searchParams,
        timeout: 10000
      });

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      logger.info(`YouTube search completed for query: "${query}" - ${videos.length} results`);

      res.json({
        success: true,
        data: {
          query,
          totalResults: response.data.pageInfo.totalResults,
          resultsCount: videos.length,
          videos
        }
      });

    } catch (error) {
      logger.error('YouTube search error:', error.message);

      if (error.response?.status === 403) {
        return res.status(403).json({
          success: false,
          message: 'YouTube API quota exceeded or invalid API key'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to search YouTube videos',
        error: error.message
      });
    }
  }

  // Get video details and auto-play URL
  async getVideoForPlayback(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      // First search for videos
      const searchResponse = await axios.get(`${youtubeConfig.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          order: 'relevance',
          maxResults: 1,
          key: youtubeConfig.apiKey
        },
        timeout: 10000
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No videos found for the given query'
        });
      }

      const video = searchResponse.data.items[0];
      const videoId = video.id.videoId;

      // Get detailed video info
      const videoResponse = await axios.get(`${youtubeConfig.baseUrl}/videos`, {
        params: {
          part: youtubeConfig.video.part,
          id: videoId,
          key: youtubeConfig.apiKey
        },
        timeout: 10000
      });

      const videoDetails = videoResponse.data.items[0];

      const result = {
        id: videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: videoDetails?.contentDetails?.duration,
        viewCount: videoDetails?.statistics?.viewCount,
        likeCount: videoDetails?.statistics?.likeCount,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        directPlayUrl: `https://www.youtube.com/watch?v=${videoId}&autoplay=1`
      };

      logger.info(`YouTube video found for query "${query}": ${result.title}`);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('YouTube video playback error:', error.message);

      if (error.response?.status === 403) {
        return res.status(403).json({
          success: false,
          message: 'YouTube API quota exceeded or invalid API key'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get video for playback',
        error: error.message
      });
    }
  }

  // Get trending videos
  async getTrendingVideos(req, res) {
    try {
      const { regionCode = 'US', maxResults = 10 } = req.query;

      const response = await axios.get(`${youtubeConfig.baseUrl}/videos`, {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults: Math.min(maxResults, 50),
          key: youtubeConfig.apiKey
        },
        timeout: 10000
      });

      const videos = response.data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        url: `https://www.youtube.com/watch?v=${item.id}`
      }));

      res.json({
        success: true,
        data: {
          regionCode,
          videos
        }
      });

    } catch (error) {
      logger.error('YouTube trending videos error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending videos',
        error: error.message
      });
    }
  }
}

export default new YouTubeController();
