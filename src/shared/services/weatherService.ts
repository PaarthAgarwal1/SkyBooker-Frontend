import axios from 'axios';
import { WeatherCondition } from '../api/staff';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface WeatherCache {
  [city: string]: {
    data: WeatherData;
    timestamp: number;
  };
}

export interface WeatherData {
  condition: WeatherCondition;
  temp: number;
  windSpeed: number;
}

const cache: WeatherCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const weatherService = {
  getCityWeather: async (city: string): Promise<WeatherData> => {
    const now = Date.now();

    // Simple cache check
    if (cache[city] && (now - cache[city].timestamp) < CACHE_DURATION) {
      return cache[city].data;
    }

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const mainCondition = response.data.weather[0].main.toLowerCase();
      const windSpeed = response.data.wind.speed * 3.6; // m/s to km/h
      let condition: WeatherCondition = 'CLEAR';

      // Mapping OpenWeather conditions to our WeatherCondition type
      if (mainCondition.includes('thunderstorm')) {
        condition = 'STORM';
      } else if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
        condition = 'RAIN';
      } else if (['fog', 'mist', 'haze', 'dust', 'smoke'].includes(mainCondition)) {
        condition = 'FOG';
      } else if (windSpeed > 15) {
        condition = 'WIND';
      }

      const weatherData: WeatherData = {
        condition,
        temp: Math.round(response.data.main.temp),
        windSpeed: Number(windSpeed.toFixed(1))
      };

      // Update cache
      cache[city] = { data: weatherData, timestamp: now };

      return weatherData;
    } catch (error) {
      console.error(`Weather API error for ${city}:`, error);
      throw error;
    }
  }
};
