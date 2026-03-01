import { defineMiddleware } from 'astro:middleware';
import { buildWeatherContext, eventToCSSMode, type WeatherData } from './utils/weatherProcessor';

export const onRequest = defineMiddleware(async (context, next) => {
  const cf = context.locals.runtime?.cf;
  const city = cf?.city || 'Melbourne';

  let weatherData: WeatherData = {
    windSpeed: 10,
    precipitation: 0,
    temperature: 20,
    humidity: 60,
    condition: 'Clear',
  };

  // Cloudflare Cache API for weather data
  const cacheUrl = new URL(`https://weather-cache.local/?city=${encodeURIComponent(city)}`);
  const cacheKey = new Request(cacheUrl.toString());
  const cache = context.locals.runtime?.caches?.default;

  let cachedResponse = undefined;
  if (cache) {
    cachedResponse = await cache.match(cacheKey);
  }

  if (cachedResponse) {
    weatherData = await cachedResponse.json();
  } else {
    try {
      // ── Real-world API fetch (OpenWeatherMap or similar) ──
      // Uncomment and configure when WEATHER_API_KEY is set in Cloudflare env:
      //
      // const apiKey = context.locals.runtime?.env?.WEATHER_API_KEY;
      // if (apiKey) {
      //   const res = await fetch(
      //     `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},AU&appid=${apiKey}&units=metric`
      //   );
      //   if (res.ok) {
      //     const owm = await res.json();
      //     weatherData = {
      //       windSpeed: Math.round((owm.wind?.speed || 0) * 3.6), // m/s → km/h
      //       precipitation: owm.rain?.['1h'] || owm.rain?.['3h'] || 0,
      //       temperature: owm.main?.temp || 20,
      //       feelsLike: owm.main?.feels_like,
      //       humidity: owm.main?.humidity,
      //       condition: owm.weather?.[0]?.main || 'Clear',
      //     };
      //   }
      // }

      // ── Dev/Fallback: simulated weather mixing all conditions for testing ──
      const roll = Math.random();
      if (roll < 0.12) weatherData = { windSpeed: 95, precipitation: 25, temperature: 14, condition: 'Hail', humidity: 95 };
      else if (roll < 0.22) weatherData = { windSpeed: 30, precipitation: 18, temperature: 13, condition: 'Thunderstorm', humidity: 90 };
      else if (roll < 0.35) weatherData = { windSpeed: 20, precipitation: 8, temperature: 14, condition: 'Heavy Rain', humidity: 88 };
      else if (roll < 0.50) weatherData = { windSpeed: 15, precipitation: 2, temperature: 16, condition: 'Drizzle', humidity: 80 };
      else if (roll < 0.58) weatherData = { windSpeed: 72, precipitation: 0, temperature: 17, condition: 'Windy', humidity: 55 };
      else if (roll < 0.68) weatherData = { windSpeed: 5, precipitation: 0, temperature: 34, condition: 'Clear', humidity: 30 };
      else if (roll < 0.82) weatherData = { windSpeed: 10, precipitation: 0, temperature: 21, condition: 'Clear', humidity: 50 };
      else if (roll < 0.88) weatherData = { windSpeed: 8, precipitation: 0, temperature: 1, condition: 'Clear', humidity: 65 };
      else if (roll < 0.94) weatherData = { windSpeed: 5, precipitation: 0, temperature: 15, condition: 'Overcast', humidity: 70 };
      else weatherData = { windSpeed: 8, precipitation: 0, temperature: 17, condition: 'Fog', humidity: 95 };

      if (cache) {
        const responseToCache = new Response(JSON.stringify(weatherData), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=900', // 15-min cache in production
          },
        });
        context.locals.runtime.waitUntil?.(cache.put(cacheKey, responseToCache));
      }
    } catch (e) {
      console.error('[TrueRoof] Weather fetch failed:', e);
    }
  }

  // Build the full rich context
  const weatherCtx = buildWeatherContext(weatherData, city, new Date());
  const cssMode = eventToCSSMode(weatherCtx.event);

  context.locals.weatherContext = weatherCtx;
  context.locals.weatherCSSMode = cssMode;

  return next();
});
