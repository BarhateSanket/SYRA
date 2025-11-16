const WEATHER_API_KEY =
  process.env.WEATHER_API_KEY || "your_openweather_api_key_here";

const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Optional: Warn if API key is missing
if (!process.env.WEATHER_API_KEY) {
  console.warn("⚠️ WEATHER_API_KEY not set. Weather features may not work.");
}

export { WEATHER_API_KEY, WEATHER_BASE_URL };
