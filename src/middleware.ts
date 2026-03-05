import { defineMiddleware } from 'astro:middleware';
import { buildWeatherContext, eventToCSSMode, type WeatherData } from './utils/weatherProcessor';

// ── Edge Optimization: Deduplicate concurrent in-flight requests ──
const inFlightWeatherRequests = new Map<string, Promise<WeatherData>>();

export const onRequest = defineMiddleware(async (context, next) => {
  // ── Short-circuit for static assets and CDN proxy ──
  // Do not execute weather API checks or context building for static requests
  const url = new URL(context.request.url);
  if (
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/cdn/') ||
    url.pathname.match(/\.(js|css|webp|png|jpg|jpeg|svg|ico|avif|woff2?)$/i)
  ) {
    return next();
  }

  const cf = context.locals.runtime?.cf;
  // Normalize city to increase edge cache hit ratio (lowercase, trimmed)
  const rawCity = (cf?.city as string) || 'Melbourne';
  const city = rawCity.trim().toLowerCase();

  let weatherData: WeatherData = {
    windSpeed: 10,
    precipitation: 0,
    temperature: 20,
    humidity: 60,
    condition: 'Clear',
  };

  // Cloudflare Cache API for weather data
  const cacheUrl = new URL(`https://weather-cache.local/?city=${encodeURIComponent(city)}`);
  const cacheKeyStr = cacheUrl.toString();
  const cacheKey = new Request(cacheKeyStr);
  const cache = context.locals.runtime?.caches?.default;

  let cachedResponse = undefined;
  if (cache) {
    try {
      cachedResponse = await cache.match(cacheKey);
    } catch (e) {
      console.warn('[TrueRoof] Cache read failed (match):', e);
    }
  }

  if (cachedResponse) {
    weatherData = await cachedResponse.json();
  } else {
    try {
      // Check if there is already an in-flight request for this cacheKey
      if (inFlightWeatherRequests.has(cacheKeyStr)) {
        weatherData = await inFlightWeatherRequests.get(cacheKeyStr)!;
      } else {
        // ── Live weather: Open-Meteo (no API key required) ──
        // Melbourne, Australia: lat=-37.8136, lon=144.9631
        const OPEN_METEO_URL =
          'https://api.open-meteo.com/v1/forecast' +
          '?latitude=-37.8136&longitude=144.9631' +
          '&current=temperature_2m,relative_humidity_2m,apparent_temperature,' +
          'precipitation,weather_code,wind_speed_10m' +
          '&wind_speed_unit=kmh' +
          '&timezone=Australia%2FMelbourne';

        const fetchWeather = async (): Promise<WeatherData> => {
          const res = await fetch(OPEN_METEO_URL);
          if (!res.ok) {
            throw new Error(`Weather fetch failed: ${res.status}`);
          }
          const om = await res.json() as {
            current: {
              temperature_2m: number;
              relative_humidity_2m: number;
              apparent_temperature: number;
              precipitation: number;
              weather_code: number;
              wind_speed_10m: number;
            };
          };
          const cur = om.current;

          // Map WMO weather codes → condition strings recognised by weatherProcessor
          const wmoToCondition = (code: number): string => {
            if (code === 0 || code === 1) return 'Clear';
            if (code === 2 || code === 3) return 'Overcast';
            if (code >= 45 && code <= 48) return 'Fog';
            if (code >= 51 && code <= 57) return 'Drizzle';
            if (code >= 61 && code <= 65) return 'Rain';
            if (code >= 66 && code <= 67) return 'Heavy Rain'; // freezing rain
            if (code >= 71 && code <= 77) return 'Overcast';   // snow (rare for Melb)
            if (code >= 80 && code <= 82) return 'Heavy Rain'; // rain showers
            if (code === 83 || code === 84) return 'Heavy Rain';
            if (code >= 85 && code <= 86) return 'Heavy Rain';
            if (code >= 95 && code <= 99) return 'Thunderstorm';
            return 'Clear';
          };

          // Detect hail: WMO 96 / 99 = thunderstorm with hail
          const condition =
            cur.weather_code === 96 || cur.weather_code === 99
              ? 'Hail'
              : wmoToCondition(cur.weather_code);

          // Detect windy even when sky is otherwise clear
          const finalCondition =
            condition === 'Clear' && cur.wind_speed_10m >= 60 ? 'Windy' : condition;

          return {
            windSpeed: Math.round(cur.wind_speed_10m),
            precipitation: cur.precipitation ?? 0,
            temperature: cur.temperature_2m,
            feelsLike: cur.apparent_temperature,
            humidity: cur.relative_humidity_2m,
            condition: finalCondition,
          };
        };

        // Store the promise in the map
        const weatherPromise = fetchWeather();
        inFlightWeatherRequests.set(cacheKeyStr, weatherPromise);

        try {
          weatherData = await weatherPromise;

          if (cache) {
            const responseToCache = new Response(JSON.stringify(weatherData), {
              headers: {
                'Content-Type': 'application/json',
                // 15-min fresh cache; serve stale (background revalidate) for 2h;
                // serve stale-if-error for 24h so origin failures don't cause TTFB spikes.
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=7200, stale-if-error=86400',
              },
            });
            context.locals.runtime.waitUntil?.(
              (async () => {
                try {
                  await cache.put(cacheKey, responseToCache);
                } catch (e) {
                  console.warn('[TrueRoof] Cache write failed (put):', e);
                }
              })()
            );
          }
        } finally {
          // Remove from map once resolved/rejected
          inFlightWeatherRequests.delete(cacheKeyStr);
        }
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
