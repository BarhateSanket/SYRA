import axios from "axios";
import {
  WEATHER_API_KEY,
  WEATHER_BASE_URL
} from "../config/weather.js";

/* ============================================================
   CURRENT WEATHER
============================================================ */
export const getWeather = async (req, res) => {
  try {
    const { city = "London", country = "GB" } = req.query;

    if (!WEATHER_API_KEY || WEATHER_API_KEY === "your_openweather_api_key_here") {
      return res.status(500).json({
        success: false,
        message: "Weather API key not configured",
        data: null
      });
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: `${city},${country}`,
        appid: WEATHER_API_KEY,
        units: "metric"
      }
    });

    if (!response.data) {
      return res.status(500).json({
        success: false,
        message: "Invalid weather API response",
        data: null
      });
    }

    const weather = response.data;

    const weatherData = {
      location: {
        city: weather.name,
        country: weather.sys?.country,
        coordinates: {
          lat: weather.coord?.lat,
          lon: weather.coord?.lon
        }
      },
      weather: {
        main: weather.weather?.[0]?.main,
        description: weather.weather?.[0]?.description,
        icon: weather.weather?.[0]?.icon
      },
      temperature: {
        current: Math.round(weather.main?.temp),
        feels_like: Math.round(weather.main?.feels_like),
        min: Math.round(weather.main?.temp_min),
        max: Math.round(weather.main?.temp_max)
      },
      humidity: weather.main?.humidity,
      pressure: weather.main?.pressure,
      visibility: weather.visibility,
      wind: {
        speed: weather.wind?.speed,
        direction: weather.wind?.deg
      },
      clouds: weather.clouds?.all,
      sunrise: weather.sys?.sunrise
        ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString()
        : null,
      sunset: weather.sys?.sunset
        ? new Date(weather.sys.sunset * 1000).toLocaleTimeString()
        : null
    };

    return res.json({
      success: true,
      message: `Weather data for ${city}`,
      data: weatherData
    });
  } catch (error) {
    console.error("Weather API error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "City not found",
        data: null
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      data: null
    });
  }
};

/* ============================================================
   WEATHER FORECAST (5-DAY / 3-HOUR)
============================================================ */
export const getWeatherForecast = async (req, res) => {
  try {
    const { city = "London", country = "GB", days = 5 } = req.query;

    if (!WEATHER_API_KEY || WEATHER_API_KEY === "your_openweather_api_key_here") {
      return res.status(500).json({
        success: false,
        message: "Weather API key not configured",
        data: null
      });
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        q: `${city},${country}`,
        appid: WEATHER_API_KEY,
        units: "metric"
      }
    });

    const forecastList = response.data?.list;
    const cityInfo = response.data?.city;

    if (!forecastList || !cityInfo) {
      return res.status(500).json({
        success: false,
        message: "Invalid forecast data",
        data: null
      });
    }

    // Group by date
    const dailyForecast = forecastList.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!acc[date]) {
        acc[date] = {
          date,
          forecasts: []
        };
      }

      acc[date].forecasts.push({
        time: new Date(item.dt * 1000).toLocaleTimeString(),
        weather: {
          main: item.weather?.[0]?.main,
          description: item.weather?.[0]?.description,
          icon: item.weather?.[0]?.icon
        },
        temperature: {
          temp: Math.round(item.main?.temp),
          feels_like: Math.round(item.main?.feels_like)
        },
        humidity: item.main?.humidity,
        wind: {
          speed: item.wind?.speed,
          direction: item.wind?.deg
        }
      });

      return acc;
    }, {});

    // Limit forecast days
    const forecastArray = Object.values(dailyForecast).slice(0, days);

    return res.json({
      success: true,
      message: `${days}-day weather forecast for ${city}`,
      data: {
        location: {
          city: cityInfo.name,
          country: cityInfo.country
        },
        forecast: forecastArray
      }
    });
  } catch (error) {
    console.error(
      "Weather forecast API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather forecast",
      data: null
    });
  }
};
