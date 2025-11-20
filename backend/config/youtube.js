import dotenv from 'dotenv';
dotenv.config();

const youtubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY,
  baseUrl: 'https://www.googleapis.com/youtube/v3',
  maxResults: 10,
  // YouTube Data API v3 configuration
  search: {
    part: 'snippet',
    type: 'video',
    order: 'relevance',
    safeSearch: 'moderate'
  },
  video: {
    part: 'snippet,statistics'
  }
};

export default youtubeConfig;
