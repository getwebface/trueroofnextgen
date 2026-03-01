import { defineMiddleware } from 'astro:middleware';
import { determineWeatherMode, type WeatherData } from './utils/weatherProcessor';

export const onRequest = defineMiddleware(async (context, next) => {
  const cf = context.locals.runtime?.cf;
  const city = cf?.city || 'Melbourne';
  
  let weatherData: WeatherData = {
    windSpeed: 10,
    precipitation: 0,
    temperature: 20,
    condition: 'Clear'
  };

  // Cloudflare Cache API for weather data
  const cacheUrl = new URL(`https://weather-cache.local/?city=${encodeURIComponent(city)}`);
  const cacheKey = new Request(cacheUrl.toString());
  
  // Try to get the cache object from Cloudflare runtime
  const cache = context.locals.runtime?.caches?.default;
  
  let cachedResponse = undefined;
  if (cache) {
    cachedResponse = await cache.match(cacheKey);
  }

  if (cachedResponse) {
    weatherData = await cachedResponse.json();
  } else {
    try {
      // Real-world API fetch placeholder (e.g., OpenWeatherMap)
      // const apiKey = context.locals.runtime?.env?.WEATHER_API_KEY;
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      // const data = await response.json();
      // weatherData = { ... map data ... }
      
      // Simulated fetch
      weatherData = {
        windSpeed: Math.random() * 70, // Randomize to test modes
        precipitation: Math.random() > 0.8 ? 5 : 0,
        temperature: 5 + Math.random() * 25,
        condition: Math.random() > 0.8 ? 'Rain' : 'Clear'
      };

      if (cache) {
        const responseToCache = new Response(JSON.stringify(weatherData), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=1800', // 30 minutes
          }
        });
        context.locals.runtime.waitUntil?.(cache.put(cacheKey, responseToCache));
      }
    } catch (e) {
      console.error('Weather fetch failed', e);
    }
  }

  const weatherMode = determineWeatherMode(weatherData);

  context.locals.weatherContext = {
    city,
    weatherMode,
    ...weatherData
  };

  return next();
});
