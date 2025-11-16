// Load environment variable
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Warn if key is missing
if (!NEWS_API_KEY) {
  console.warn("⚠️ NEWS_API_KEY is missing — News API requests will fail.");
}

// Base URL for all news API calls
const NEWS_BASE_URL = "https://newsapi.org/v2";

// Export safely
export {
  NEWS_API_KEY,
  NEWS_BASE_URL
};
