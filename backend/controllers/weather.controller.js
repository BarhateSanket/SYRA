import axios from 'axios';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../config/weather.js';

const getWeather = async (req, res) => {
  try {
    const { city = 'London', country = 'GB' } = req.query;

    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Weather API key not configured',
        data: null
      });
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: `${city},${country}`,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = {
      location: {
        city: response.data.name,
        country: response.data.sys.country,
        coordinates: {
          lat: response.data.coord.lat,
          lon: response.data.coord.lon
        }
      },
      weather: {
        main: response.data.weather[0].main,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon
      },
      temperature: {
        current: Math.round(response.data.main.temp),
        feels_like: Math.round(response.data.main.feels_like),
        min: Math.round(response.data.main.temp_min),
        max: Math.round(response.data.main.temp_max)
      },
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      visibility: response.data.visibility,
      wind: {
        speed: response.data.wind.speed,
        direction: response.data.wind.deg
      },
      clouds: response.data.clouds.all,
      sunrise: new Date(response.data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(response.data.sys.sunset * 1000).toLocaleTimeString()
    };

    res.json({
      success: true,
      message: `Weather data for ${city}`,
      data: weatherData
    });

  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found',
        data: null
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      data: null
    });
  }
};

const getWeatherForecast = async (req, res) => {
  try {
    const { city = 'London', country = 'GB', days = 5 } = req.query;

    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Weather API key not configured',
        data: null
      });
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        q: `${city},${country}`,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    // Group forecast by day
    const dailyForecast = response.data.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toDateString();

      if (!acc[date]) {
        acc[date] = {
          date: date,
          forecasts: []
        };
      }

      acc[date].forecasts.push({
        time: new Date(item.dt * 1000).toLocaleTimeString(),
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        temperature: {
          temp: Math.round(item.main.temp),
          feels_like: Math.round(item.main.feels_like)
        },
        humidity: item.main.humidity,
        wind: {
          speed: item.wind.speed,
          direction: item.wind.deg
        }
      });

      return acc;
    }, {});

    const forecastArray = Object.values(dailyForecast).slice(0, days);

    res.json({
      success: true,
      message: `${days}-day weather forecast for ${city}`,
      data: {
        location: {
          city: response.data.city.name,
          country: response.data.city.country
        },
        forecast: forecastArray
      }
    });

  } catch (error) {
    console.error('Weather forecast API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
      data: null
    });
  }
};

export {
  getWeather,
  getWeatherForecast
};
