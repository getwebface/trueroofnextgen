globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/index_DRRaTh15.mjs';
import './chunks/astro-designed-error-pages_Dm97gQfD.mjs';
import './chunks/astro/server_D5t_fZ7D.mjs';

const EVENT_BASE_SCORES = {
  HAIL_STORM: 100,
  THUNDERSTORM: 85,
  HIGH_WIND: 75,
  HEAVY_RAIN: 70,
  DRIZZLE: 50,
  FROST: 45,
  CLEAR_HOT: 35,
  FOG: 25,
  OVERCAST: 20,
  CLEAR_MILD: 15,
  DEFAULT: 5
};
const SECONDARY_MIN_SCORE = 20;
function scoreWeatherSignals(data, season, timeOfDay, isWeekend) {
  const cond = data.condition.toLowerCase();
  const active = /* @__PURE__ */ new Map();
  const setIfActive = (event, passes) => {
    if (passes) active.set(event, EVENT_BASE_SCORES[event]);
  };
  setIfActive("HAIL_STORM", cond.includes("hail") || data.windSpeed > 80 && data.precipitation > 10);
  setIfActive("THUNDERSTORM", cond.includes("thunder") || cond.includes("storm"));
  setIfActive("HIGH_WIND", data.windSpeed >= 60 || cond.includes("wind"));
  setIfActive("HEAVY_RAIN", data.precipitation > 8 || cond.includes("heavy rain"));
  setIfActive("DRIZZLE", data.precipitation > 0.5 || cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle"));
  setIfActive("FROST", data.temperature <= 2);
  setIfActive("FOG", cond.includes("fog") || cond.includes("mist"));
  setIfActive("OVERCAST", cond.includes("overcast") || cond.includes("cloud"));
  setIfActive("CLEAR_HOT", data.temperature >= 32 || data.feelsLike !== void 0 && data.feelsLike >= 34);
  setIfActive("CLEAR_MILD", cond.includes("clear") || cond.includes("sunny") || cond.includes("fine"));
  if (active.size === 0) active.set("DEFAULT", EVENT_BASE_SCORES["DEFAULT"]);
  for (const [event, score] of active) {
    let modifier = 0;
    if (season === "WINTER") {
      if (["HAIL_STORM", "THUNDERSTORM", "HEAVY_RAIN", "DRIZZLE", "FROST", "OVERCAST"].includes(event)) modifier += 10;
    }
    if (season === "AUTUMN") {
      modifier += 8;
    }
    if (season === "SUMMER" && event === "CLEAR_HOT") modifier += 12;
    if (season === "SPRING" && ["CLEAR_MILD", "OVERCAST"].includes(event)) modifier += 6;
    if ((timeOfDay === "MORNING" || timeOfDay === "MIDDAY") && ["CLEAR_MILD", "CLEAR_HOT"].includes(event)) modifier += 5;
    if (isWeekend) modifier += 3;
    active.set(event, score + modifier);
  }
  const sorted = [...active.entries()].sort((a, b) => b[1] - a[1]);
  const [primaryEvent] = sorted[0];
  const secondaryEntry = sorted.find(([evt, score]) => evt !== primaryEvent && score >= SECONDARY_MIN_SCORE);
  const secondary = secondaryEntry?.[0];
  return { primary: primaryEvent, secondary };
}
function getTemporalContext(now) {
  const hour = now.getHours();
  const month = now.getMonth();
  const dayNum = now.getDay();
  let timeOfDay;
  if (hour >= 5 && hour < 7) timeOfDay = "DAWN";
  else if (hour >= 7 && hour < 11) timeOfDay = "MORNING";
  else if (hour >= 11 && hour < 14) timeOfDay = "MIDDAY";
  else if (hour >= 14 && hour < 18) timeOfDay = "AFTERNOON";
  else if (hour >= 18 && hour < 21) timeOfDay = "EVENING";
  else timeOfDay = "NIGHT";
  let season;
  if (month >= 11 || month <= 1) season = "SUMMER";
  else if (month >= 2 && month <= 4) season = "AUTUMN";
  else if (month >= 5 && month <= 7) season = "WINTER";
  else season = "SPRING";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return {
    timeOfDay,
    season,
    hour,
    dayOfWeek: days[dayNum],
    isWeekend: dayNum === 0 || dayNum === 6,
    monthName: months[month]
  };
}
function computeUrgency(event, season, timeOfDay, secondary) {
  if (event === "HAIL_STORM") return 5;
  if (event === "THUNDERSTORM" || event === "HEAVY_RAIN") return 4;
  if (event === "HIGH_WIND") return 4;
  if (event === "DRIZZLE") return 3;
  if (event === "FROST") return 3;
  if (season === "AUTUMN") return 2;
  if (season === "WINTER") return 3;
  if (season === "SPRING") return 2;
  if (event === "CLEAR_MILD" && (timeOfDay === "MORNING" || timeOfDay === "MIDDAY")) return 2;
  if (event === "CLEAR_HOT") return 1;
  if (secondary && ["HAIL_STORM", "THUNDERSTORM", "HEAVY_RAIN", "HIGH_WIND"].includes(secondary)) {
    const base = 1;
    return Math.min(base + 1, 5);
  }
  return 1;
}
function rankServices(event, season, urgency) {
  const serviceMap = {
    "metal-flashings": { slug: "metal-flashings", weight: 0, trigger: "flashing failures" },
    "cleaning": { slug: "cleaning", weight: 0, trigger: "annual maintenance" },
    "tiled-restoration": { slug: "tiled-restoration", weight: 0, trigger: "full restoration" }
  };
  if (event === "HAIL_STORM" || event === "THUNDERSTORM") {
    serviceMap["metal-flashings"].weight = 10;
    serviceMap["metal-flashings"].trigger = "storm-damaged flashings and valleys";
    serviceMap["tiled-restoration"].weight = 8;
    serviceMap["tiled-restoration"].trigger = "cracked or displaced tiles";
    serviceMap["cleaning"].weight = 2;
    serviceMap["cleaning"].trigger = "post-storm debris clearance";
  } else if (event === "HEAVY_RAIN" || event === "DRIZZLE") {
    serviceMap["metal-flashings"].weight = 9;
    serviceMap["metal-flashings"].trigger = "flashing leaks showing in rain";
    serviceMap["tiled-restoration"].weight = 6;
    serviceMap["tiled-restoration"].trigger = "cracked pointing letting in water";
    serviceMap["cleaning"].weight = 4;
    serviceMap["cleaning"].trigger = "blocked valleys causing overflow";
  } else if (event === "HIGH_WIND") {
    serviceMap["tiled-restoration"].weight = 9;
    serviceMap["tiled-restoration"].trigger = "wind-lifted or displaced tiles";
    serviceMap["metal-flashings"].weight = 7;
    serviceMap["metal-flashings"].trigger = "wind-lifted flashings";
    serviceMap["cleaning"].weight = 3;
    serviceMap["cleaning"].trigger = "debris cleared from gutters";
  } else if (event === "FROST") {
    serviceMap["tiled-restoration"].weight = 8;
    serviceMap["tiled-restoration"].trigger = "frost-cracked pointing mortar";
    serviceMap["metal-flashings"].weight = 6;
    serviceMap["metal-flashings"].trigger = "metal contraction causing seal gaps";
    serviceMap["cleaning"].weight = 4;
    serviceMap["cleaning"].trigger = "moss growth in cool/damp conditions";
  } else if (season === "AUTUMN") {
    serviceMap["tiled-restoration"].weight = 8;
    serviceMap["tiled-restoration"].trigger = "pre-winter full restoration before the cold sets in";
    serviceMap["cleaning"].weight = 7;
    serviceMap["cleaning"].trigger = "autumn leaf and moss clean before winter";
    serviceMap["metal-flashings"].weight = 6;
    serviceMap["metal-flashings"].trigger = "flashing inspection before winter rain";
  } else if (season === "WINTER") {
    serviceMap["metal-flashings"].weight = 8;
    serviceMap["metal-flashings"].trigger = "winter leak diagnosis";
    serviceMap["tiled-restoration"].weight = 7;
    serviceMap["tiled-restoration"].trigger = "winter damage assessment";
    serviceMap["cleaning"].weight = 5;
    serviceMap["cleaning"].trigger = "moss thriving in winter damp";
  } else if (event === "CLEAR_MILD") {
    serviceMap["tiled-restoration"].weight = 10;
    serviceMap["tiled-restoration"].trigger = "perfect weather for coating application";
    serviceMap["cleaning"].weight = 8;
    serviceMap["cleaning"].trigger = "ideal conditions for high-pressure clean";
    serviceMap["metal-flashings"].weight = 5;
    serviceMap["metal-flashings"].trigger = "easy access in good conditions";
  } else if (event === "CLEAR_HOT") {
    serviceMap["cleaning"].weight = 9;
    serviceMap["cleaning"].trigger = "summer algae and moss growth season";
    serviceMap["tiled-restoration"].weight = 6;
    serviceMap["tiled-restoration"].trigger = "coating works best in mild weather — book now before the next heatwave";
    serviceMap["metal-flashings"].weight = 5;
    serviceMap["metal-flashings"].trigger = "thermal expansion checking all seals";
  } else if (season === "SPRING") {
    serviceMap["cleaning"].weight = 9;
    serviceMap["cleaning"].trigger = "spring clean — remove winter moss and grime";
    serviceMap["tiled-restoration"].weight = 8;
    serviceMap["tiled-restoration"].trigger = "post-winter restoration before summer heat";
    serviceMap["metal-flashings"].weight = 6;
    serviceMap["metal-flashings"].trigger = "post-winter flashing inspection";
  } else {
    serviceMap["tiled-restoration"].weight = 7;
    serviceMap["cleaning"].weight = 6;
    serviceMap["metal-flashings"].weight = 5;
  }
  return Object.values(serviceMap).sort((a, b) => b.weight - a.weight);
}
function buildCopyHints(event, timeOfDay, season, urgency, monthName, isWeekend) {
  const urgencyLabels = {
    5: "Emergency",
    4: "Urgent",
    3: "Important",
    2: "Seasonal",
    1: "Ideal"
  };
  const weatherDescriptions = {
    HAIL_STORM: "a hailstorm",
    THUNDERSTORM: "a thunderstorm",
    HEAVY_RAIN: "heavy rain",
    DRIZZLE: "rain",
    HIGH_WIND: "strong winds",
    CLEAR_HOT: "hot sunny conditions",
    CLEAR_MILD: "clear mild conditions",
    OVERCAST: "overcast skies",
    FROST: "frost",
    FOG: "foggy conditions",
    DEFAULT: "current conditions"
  };
  const timeGreetings = {
    DAWN: "Early this morning",
    MORNING: "This morning",
    MIDDAY: "Right now",
    AFTERNOON: "This afternoon",
    EVENING: "This evening",
    NIGHT: "Tonight"
  };
  const seasonalTips = {
    SUMMER: `${monthName} is peak season for algae and moss — a clean now prevents tile damage over summer.`,
    AUTUMN: `${monthName} is the critical window before winter — small roof issues become expensive leaks in the cold.`,
    WINTER: `Winter moisture is hard on tile pointing and flashings — don't wait for a leak to act.`,
    SPRING: `Post-winter is the best time to assess damage and restore before the summer heat sets in.`
  };
  const ctas = {
    5: "Call",
    4: isWeekend ? "Call" : "Book",
    3: "Book",
    2: "Request",
    1: "Schedule"
  };
  const emojis = {
    HAIL_STORM: "🚨",
    THUNDERSTORM: "⛈️",
    HEAVY_RAIN: "🌧️",
    DRIZZLE: "🌦️",
    HIGH_WIND: "💨",
    CLEAR_HOT: "☀️",
    CLEAR_MILD: "🌤️",
    FROST: "❄️",
    FOG: "🌫️",
    OVERCAST: "☁️",
    DEFAULT: "🏠"
  };
  return {
    urgencyLabel: urgencyLabels[urgency],
    weatherDescription: weatherDescriptions[event] || "current conditions",
    timeGreeting: timeGreetings[timeOfDay],
    seasonalTip: seasonalTips[season],
    callToAction: ctas[urgency],
    bannerEmoji: emojis[event] || "🏠"
  };
}
function buildWeatherContext(data, city, now = /* @__PURE__ */ new Date()) {
  const temporal = getTemporalContext(now);
  const { primary: event, secondary: secondaryEvent } = scoreWeatherSignals(
    data,
    temporal.season,
    temporal.timeOfDay,
    temporal.isWeekend
  );
  const urgency = computeUrgency(event, temporal.season, temporal.timeOfDay, secondaryEvent);
  const services = rankServices(event, temporal.season);
  const copyHints = buildCopyHints(event, temporal.timeOfDay, temporal.season, urgency, temporal.monthName, temporal.isWeekend);
  return {
    city,
    raw: data,
    event,
    secondaryEvent,
    ...temporal,
    urgency,
    services,
    topService: services[0],
    copyHints,
    // Surface convenience
    temperature: data.temperature,
    condition: data.condition,
    windSpeed: data.windSpeed,
    precipitation: data.precipitation
  };
}
function eventToCSSMode(event) {
  const map = {
    HAIL_STORM: "weather-storm",
    THUNDERSTORM: "weather-storm",
    HEAVY_RAIN: "weather-rain",
    DRIZZLE: "weather-rain",
    HIGH_WIND: "weather-storm",
    CLEAR_HOT: "weather-clear-hot",
    CLEAR_MILD: "weather-clear",
    OVERCAST: "weather-overcast",
    FROST: "weather-frost",
    FOG: "weather-overcast",
    DEFAULT: "weather-default"
  };
  return map[event] || "weather-default";
}

const onRequest$2 = defineMiddleware(async (context, next) => {
  const cf = context.locals.runtime?.cf;
  const city = cf?.city || "Melbourne";
  let weatherData = {
    windSpeed: 10,
    precipitation: 0,
    temperature: 20,
    humidity: 60,
    condition: "Clear"
  };
  const cacheUrl = new URL(`https://weather-cache.local/?city=${encodeURIComponent(city)}`);
  const cacheKey = new Request(cacheUrl.toString());
  const cache = context.locals.runtime?.caches?.default;
  let cachedResponse = void 0;
  if (cache) {
    cachedResponse = await cache.match(cacheKey);
  }
  if (cachedResponse) {
    weatherData = await cachedResponse.json();
  } else {
    try {
      const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=Australia%2FMelbourne";
      const res = await fetch(OPEN_METEO_URL);
      if (res.ok) {
        const om = await res.json();
        const cur = om.current;
        const wmoToCondition = (code) => {
          if (code === 0 || code === 1) return "Clear";
          if (code === 2 || code === 3) return "Overcast";
          if (code >= 45 && code <= 48) return "Fog";
          if (code >= 51 && code <= 57) return "Drizzle";
          if (code >= 61 && code <= 65) return "Rain";
          if (code >= 66 && code <= 67) return "Heavy Rain";
          if (code >= 71 && code <= 77) return "Overcast";
          if (code >= 80 && code <= 82) return "Heavy Rain";
          if (code === 83 || code === 84) return "Heavy Rain";
          if (code >= 85 && code <= 86) return "Heavy Rain";
          if (code >= 95 && code <= 99) return "Thunderstorm";
          return "Clear";
        };
        const condition = cur.weather_code === 96 || cur.weather_code === 99 ? "Hail" : wmoToCondition(cur.weather_code);
        const finalCondition = condition === "Clear" && cur.wind_speed_10m >= 60 ? "Windy" : condition;
        weatherData = {
          windSpeed: Math.round(cur.wind_speed_10m),
          precipitation: cur.precipitation ?? 0,
          temperature: cur.temperature_2m,
          feelsLike: cur.apparent_temperature,
          humidity: cur.relative_humidity_2m,
          condition: finalCondition
        };
      }
      if (cache) {
        const responseToCache = new Response(JSON.stringify(weatherData), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "s-maxage=900"
            // 15-min cache in production
          }
        });
        context.locals.runtime.waitUntil?.(cache.put(cacheKey, responseToCache));
      }
    } catch (e) {
      console.error("[TrueRoof] Weather fetch failed:", e);
    }
  }
  const weatherCtx = buildWeatherContext(weatherData, city, /* @__PURE__ */ new Date());
  const cssMode = eventToCSSMode(weatherCtx.event);
  context.locals.weatherContext = weatherCtx;
  context.locals.weatherCSSMode = cssMode;
  return next();
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2

);

export { onRequest };
