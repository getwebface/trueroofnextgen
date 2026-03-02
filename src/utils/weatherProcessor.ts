// src/utils/weatherProcessor.ts
// TrueRoof NextGen — Rich Weather Context Engine
// Maps live weather events + temporal signals → urgency + service relevance

// ── Pure atmospheric event types (not service-named) ──
export type WeatherEvent =
  | 'HAIL_STORM'
  | 'HEAVY_RAIN'
  | 'DRIZZLE'
  | 'THUNDERSTORM'
  | 'HIGH_WIND'
  | 'CLEAR_HOT'
  | 'CLEAR_MILD'
  | 'OVERCAST'
  | 'FROST'
  | 'FOG'
  | 'DEFAULT';

// ── Time of day buckets ──
export type TimeOfDay = 'DAWN' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

// ── Australian seasons (southern hemisphere) ──
export type Season = 'SUMMER' | 'AUTUMN' | 'WINTER' | 'SPRING';

// ── Urgency: 1 (curiosity) → 5 (emergency) ──
export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;

// ── Live weather payload (from Cloudflare cf object or weather API) ──
export interface WeatherData {
  windSpeed: number;      // km/h
  precipitation: number;  // mm/hr
  temperature: number;    // °C
  humidity?: number;      // %
  condition: string;      // raw condition string: 'Clear', 'Rain', 'Hail', 'Thunderstorm', etc.
  feelsLike?: number;     // °C
}

// ── Service relevance signal ──
export type ServiceSignal = {
  slug: string;    // matches src/content/services/ slug
  weight: number;  // 0–10, higher = more relevant now
  trigger: string; // why this service is relevant, used in copy
};

// ── The full context object injected into Astro.locals ──
export interface WeatherContext {
  // Raw data
  city: string;
  raw: WeatherData;

  // Derived atmospheric classification
  event: WeatherEvent;
  /** Second-strongest signal when two conditions are meaningfully active.
   *  e.g. primary=HIGH_WIND, secondary=CLEAR_HOT on a hot windy day. */
  secondaryEvent?: WeatherEvent;

  // Temporal context
  timeOfDay: TimeOfDay;
  season: Season;
  dayOfWeek: string;        // 'Monday', 'Tuesday', etc.
  isWeekend: boolean;
  hour: number;             // 0–23 local-ish
  monthName: string;

  // Computed signals
  urgency: UrgencyLevel;
  services: ServiceSignal[];        // sorted by weight desc
  topService: ServiceSignal;        // most relevant service right now
  copyHints: CopyHints;

  // Surface convenience props (still needed for templates)
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
}

// ── Copy hints: raw strings the UI uses to compose headlines and banners ──
export interface CopyHints {
  urgencyLabel: string;         // 'Emergency', 'Urgent', 'Seasonal', 'Ideal', 'Standard'
  weatherDescription: string;  // 'hailstorm', 'heavy rain', 'mild morning', etc.
  timeGreeting: string;         // 'Good morning', 'This afternoon', 'Tonight', etc.
  seasonalTip: string;          // season-aware advice
  callToAction: string;         // primary CTA verb: 'Call', 'Book', 'Request'
  bannerEmoji: string;
}

// ──────────────────────────────────────────────────
// Roofing-priority event scorer
// Evaluates ALL events independently → returns the
// highest-scoring as primary, plus an optional secondary
// (score ≥ 20) when two meaningful signals co-exist.
// ──────────────────────────────────────────────────

/** Base priority scores — higher = more urgent for roofing */
const EVENT_BASE_SCORES: Record<WeatherEvent, number> = {
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
  DEFAULT: 5,
};

/** Secondary threshold — must reach this score to surface as secondary */
const SECONDARY_MIN_SCORE = 20;

export function scoreWeatherSignals(
  data: WeatherData,
  season: Season,
  timeOfDay: TimeOfDay,
  isWeekend: boolean,
): { primary: WeatherEvent; secondary?: WeatherEvent } {
  const cond = data.condition.toLowerCase();

  // ── Step 1: evaluate each event's raw data threshold ──
  const active = new Map<WeatherEvent, number>();

  const setIfActive = (event: WeatherEvent, passes: boolean) => {
    if (passes) active.set(event, EVENT_BASE_SCORES[event]);
  };

  setIfActive('HAIL_STORM', cond.includes('hail') || (data.windSpeed > 80 && data.precipitation > 10));
  setIfActive('THUNDERSTORM', cond.includes('thunder') || cond.includes('storm'));
  // High wind: either explicit condition string OR speed threshold
  setIfActive('HIGH_WIND', data.windSpeed >= 60 || cond.includes('wind'));
  setIfActive('HEAVY_RAIN', data.precipitation > 8 || cond.includes('heavy rain'));
  setIfActive('DRIZZLE', data.precipitation > 0.5 || cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle'));
  setIfActive('FROST', data.temperature <= 2);
  setIfActive('FOG', cond.includes('fog') || cond.includes('mist'));
  setIfActive('OVERCAST', cond.includes('overcast') || cond.includes('cloud'));
  // CLEAR_HOT: heat threshold OR feels-like heat
  setIfActive('CLEAR_HOT', data.temperature >= 32 || (data.feelsLike !== undefined && data.feelsLike >= 34));
  setIfActive('CLEAR_MILD', cond.includes('clear') || cond.includes('sunny') || cond.includes('fine'));

  // Ensure at least DEFAULT is present
  if (active.size === 0) active.set('DEFAULT', EVENT_BASE_SCORES['DEFAULT']);

  // ── Step 2: apply temporal modifier to each active event ──
  for (const [event, score] of active) {
    let modifier = 0;

    // Season modifiers
    if (season === 'WINTER') {
      if (['HAIL_STORM', 'THUNDERSTORM', 'HEAVY_RAIN', 'DRIZZLE', 'FROST', 'OVERCAST'].includes(event)) modifier += 10;
    }
    if (season === 'AUTUMN') {
      modifier += 8; // entire pre-winter window is elevated
    }
    if (season === 'SUMMER' && event === 'CLEAR_HOT') modifier += 12;
    if (season === 'SPRING' && ['CLEAR_MILD', 'OVERCAST'].includes(event)) modifier += 6;

    // Time-of-day modifiers
    if ((timeOfDay === 'MORNING' || timeOfDay === 'MIDDAY') && ['CLEAR_MILD', 'CLEAR_HOT'].includes(event)) modifier += 5;

    // Weekend: homeowner is home, more likely to notice / call
    if (isWeekend) modifier += 3;

    active.set(event, score + modifier);
  }

  // ── Step 3: sort, return primary + optional secondary ──
  const sorted = [...active.entries()].sort((a, b) => b[1] - a[1]);
  const [primaryEvent] = sorted[0];

  // Find first distinct event with sufficient score
  const secondaryEntry = sorted.find(([evt, score]) => evt !== primaryEvent && score >= SECONDARY_MIN_SCORE);
  const secondary = secondaryEntry?.[0];

  return { primary: primaryEvent, secondary };
}

// ──────────────────────────────────────────────────
// Backwards-compatible shim (used by callers that
// only need a single WeatherEvent)
// ──────────────────────────────────────────────────
export function classifyWeatherEvent(data: WeatherData): WeatherEvent {
  // Season/time/weekend not available here — use neutral defaults
  return scoreWeatherSignals(data, 'SPRING', 'MIDDAY', false).primary;
}

// ──────────────────────────────────────────────────
// Helper: temporal context from a Date
// ──────────────────────────────────────────────────
export function getTemporalContext(now: Date) {
  const hour = now.getHours();
  const month = now.getMonth(); // 0-indexed
  const dayNum = now.getDay(); // 0 = Sunday

  // Time buckets
  let timeOfDay: TimeOfDay;
  if (hour >= 5 && hour < 7) timeOfDay = 'DAWN';
  else if (hour >= 7 && hour < 11) timeOfDay = 'MORNING';
  else if (hour >= 11 && hour < 14) timeOfDay = 'MIDDAY';
  else if (hour >= 14 && hour < 18) timeOfDay = 'AFTERNOON';
  else if (hour >= 18 && hour < 21) timeOfDay = 'EVENING';
  else timeOfDay = 'NIGHT';

  // Australian seasons (southern hemisphere)
  let season: Season;
  if (month >= 11 || month <= 1) season = 'SUMMER';
  else if (month >= 2 && month <= 4) season = 'AUTUMN';
  else if (month >= 5 && month <= 7) season = 'WINTER';
  else season = 'SPRING';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    timeOfDay,
    season,
    hour,
    dayOfWeek: days[dayNum],
    isWeekend: dayNum === 0 || dayNum === 6,
    monthName: months[month],
  };
}

// ──────────────────────────────────────────────────
// Helper: compute urgency level
// ──────────────────────────────────────────────────
function computeUrgency(
  event: WeatherEvent,
  season: Season,
  timeOfDay: TimeOfDay,
  secondary?: WeatherEvent,
): UrgencyLevel {
  // High-urgency weather events
  if (event === 'HAIL_STORM') return 5;
  if (event === 'THUNDERSTORM' || event === 'HEAVY_RAIN') return 4;
  if (event === 'HIGH_WIND') return 4;
  if (event === 'DRIZZLE') return 3;

  // Seasonal urgency for prevention
  if (event === 'FROST') return 3;
  if (season === 'AUTUMN') return 2; // pre-winter check-up window
  if (season === 'WINTER') return 3; // active damage risk
  if (season === 'SPRING') return 2; // post-winter assessment

  // Clear conditions — good for work, low urgency
  if (event === 'CLEAR_MILD' && (timeOfDay === 'MORNING' || timeOfDay === 'MIDDAY')) return 2;
  if (event === 'CLEAR_HOT') return 1;

  // Secondary bump: if a high-damage event is the secondary signal, raise urgency by 1
  if (secondary && (['HAIL_STORM', 'THUNDERSTORM', 'HEAVY_RAIN', 'HIGH_WIND'] as WeatherEvent[]).includes(secondary)) {
    // Clamp to max 5
    const base: UrgencyLevel = 1;
    return Math.min(base + 1, 5) as UrgencyLevel;
  }

  return 1;
}

// ──────────────────────────────────────────────────
// Helper: rank service relevance based on weather event + temporal context
// ──────────────────────────────────────────────────
function rankServices(event: WeatherEvent, season: Season, urgency: UrgencyLevel): ServiceSignal[] {
  const serviceMap: Record<string, ServiceSignal> = {
    'metal-flashings': { slug: 'metal-flashings', weight: 0, trigger: 'flashing failures' },
    'cleaning': { slug: 'cleaning', weight: 0, trigger: 'annual maintenance' },
    'tiled-restoration': { slug: 'tiled-restoration', weight: 0, trigger: 'full restoration' },
  };

  // Hail or heavy storm → flashings and structural are #1
  if (event === 'HAIL_STORM' || event === 'THUNDERSTORM') {
    serviceMap['metal-flashings'].weight = 10;
    serviceMap['metal-flashings'].trigger = 'storm-damaged flashings and valleys';
    serviceMap['tiled-restoration'].weight = 8;
    serviceMap['tiled-restoration'].trigger = 'cracked or displaced tiles';
    serviceMap['cleaning'].weight = 2;
    serviceMap['cleaning'].trigger = 'post-storm debris clearance';
  }
  // Heavy rain / drizzle → active leaks → flashings first
  else if (event === 'HEAVY_RAIN' || event === 'DRIZZLE') {
    serviceMap['metal-flashings'].weight = 9;
    serviceMap['metal-flashings'].trigger = 'flashing leaks showing in rain';
    serviceMap['tiled-restoration'].weight = 6;
    serviceMap['tiled-restoration'].trigger = 'cracked pointing letting in water';
    serviceMap['cleaning'].weight = 4;
    serviceMap['cleaning'].trigger = 'blocked valleys causing overflow';
  }
  // High wind → loose ridges and tiles
  else if (event === 'HIGH_WIND') {
    serviceMap['tiled-restoration'].weight = 9;
    serviceMap['tiled-restoration'].trigger = 'wind-lifted or displaced tiles';
    serviceMap['metal-flashings'].weight = 7;
    serviceMap['metal-flashings'].trigger = 'wind-lifted flashings';
    serviceMap['cleaning'].weight = 3;
    serviceMap['cleaning'].trigger = 'debris cleared from gutters';
  }
  // Frost → mortar cracking
  else if (event === 'FROST') {
    serviceMap['tiled-restoration'].weight = 8;
    serviceMap['tiled-restoration'].trigger = 'frost-cracked pointing mortar';
    serviceMap['metal-flashings'].weight = 6;
    serviceMap['metal-flashings'].trigger = 'metal contraction causing seal gaps';
    serviceMap['cleaning'].weight = 4;
    serviceMap['cleaning'].trigger = 'moss growth in cool/damp conditions';
  }
  // Autumn → pre-winter preventative window
  else if (season === 'AUTUMN') {
    serviceMap['tiled-restoration'].weight = 8;
    serviceMap['tiled-restoration'].trigger = 'pre-winter full restoration before the cold sets in';
    serviceMap['cleaning'].weight = 7;
    serviceMap['cleaning'].trigger = 'autumn leaf and moss clean before winter';
    serviceMap['metal-flashings'].weight = 6;
    serviceMap['metal-flashings'].trigger = 'flashing inspection before winter rain';
  }
  // Winter → damage assessment
  else if (season === 'WINTER') {
    serviceMap['metal-flashings'].weight = 8;
    serviceMap['metal-flashings'].trigger = 'winter leak diagnosis';
    serviceMap['tiled-restoration'].weight = 7;
    serviceMap['tiled-restoration'].trigger = 'winter damage assessment';
    serviceMap['cleaning'].weight = 5;
    serviceMap['cleaning'].trigger = 'moss thriving in winter damp';
  }
  // Clear mild → ideal work conditions
  else if (event === 'CLEAR_MILD') {
    serviceMap['tiled-restoration'].weight = 10;
    serviceMap['tiled-restoration'].trigger = 'perfect weather for coating application';
    serviceMap['cleaning'].weight = 8;
    serviceMap['cleaning'].trigger = 'ideal conditions for high-pressure clean';
    serviceMap['metal-flashings'].weight = 5;
    serviceMap['metal-flashings'].trigger = 'easy access in good conditions';
  }
  // Clear hot → cleaning / shade timing considerations
  else if (event === 'CLEAR_HOT') {
    serviceMap['cleaning'].weight = 9;
    serviceMap['cleaning'].trigger = 'summer algae and moss growth season';
    serviceMap['tiled-restoration'].weight = 6;
    serviceMap['tiled-restoration'].trigger = 'coating works best in mild weather — book now before the next heatwave';
    serviceMap['metal-flashings'].weight = 5;
    serviceMap['metal-flashings'].trigger = 'thermal expansion checking all seals';
  }
  // Spring → post-winter assessment
  else if (season === 'SPRING') {
    serviceMap['cleaning'].weight = 9;
    serviceMap['cleaning'].trigger = 'spring clean — remove winter moss and grime';
    serviceMap['tiled-restoration'].weight = 8;
    serviceMap['tiled-restoration'].trigger = 'post-winter restoration before summer heat';
    serviceMap['metal-flashings'].weight = 6;
    serviceMap['metal-flashings'].trigger = 'post-winter flashing inspection';
  }
  // Default
  else {
    serviceMap['tiled-restoration'].weight = 7;
    serviceMap['cleaning'].weight = 6;
    serviceMap['metal-flashings'].weight = 5;
  }

  return Object.values(serviceMap).sort((a, b) => b.weight - a.weight);
}

// ──────────────────────────────────────────────────
// Helper: build copy hints
// ──────────────────────────────────────────────────
function buildCopyHints(
  event: WeatherEvent,
  timeOfDay: TimeOfDay,
  season: Season,
  urgency: UrgencyLevel,
  monthName: string,
  isWeekend: boolean,
): CopyHints {
  const urgencyLabels: Record<UrgencyLevel, string> = {
    5: 'Emergency',
    4: 'Urgent',
    3: 'Important',
    2: 'Seasonal',
    1: 'Ideal'
  };

  const weatherDescriptions: Partial<Record<WeatherEvent, string>> = {
    HAIL_STORM: 'a hailstorm',
    THUNDERSTORM: 'a thunderstorm',
    HEAVY_RAIN: 'heavy rain',
    DRIZZLE: 'rain',
    HIGH_WIND: 'strong winds',
    CLEAR_HOT: 'hot sunny conditions',
    CLEAR_MILD: 'clear mild conditions',
    OVERCAST: 'overcast skies',
    FROST: 'frost',
    FOG: 'foggy conditions',
    DEFAULT: 'current conditions',
  };

  const timeGreetings: Record<TimeOfDay, string> = {
    DAWN: 'Early this morning',
    MORNING: 'This morning',
    MIDDAY: 'Right now',
    AFTERNOON: 'This afternoon',
    EVENING: 'This evening',
    NIGHT: 'Tonight',
  };

  const seasonalTips: Record<Season, string> = {
    SUMMER: `${monthName} is peak season for algae and moss — a clean now prevents tile damage over summer.`,
    AUTUMN: `${monthName} is the critical window before winter — small roof issues become expensive leaks in the cold.`,
    WINTER: `Winter moisture is hard on tile pointing and flashings — don't wait for a leak to act.`,
    SPRING: `Post-winter is the best time to assess damage and restore before the summer heat sets in.`,
  };

  const ctas: Record<UrgencyLevel, string> = {
    5: 'Call',
    4: isWeekend ? 'Call' : 'Book',
    3: 'Book',
    2: 'Request',
    1: 'Schedule',
  };

  const emojis: Partial<Record<WeatherEvent, string>> = {
    HAIL_STORM: '🚨',
    THUNDERSTORM: '⛈️',
    HEAVY_RAIN: '🌧️',
    DRIZZLE: '🌦️',
    HIGH_WIND: '💨',
    CLEAR_HOT: '☀️',
    CLEAR_MILD: '🌤️',
    FROST: '❄️',
    FOG: '🌫️',
    OVERCAST: '☁️',
    DEFAULT: '🏠',
  };

  return {
    urgencyLabel: urgencyLabels[urgency],
    weatherDescription: weatherDescriptions[event] || 'current conditions',
    timeGreeting: timeGreetings[timeOfDay],
    seasonalTip: seasonalTips[season],
    callToAction: ctas[urgency],
    bannerEmoji: emojis[event] || '🏠',
  };
}

// ──────────────────────────────────────────────────
// Main: build the full WeatherContext
// ──────────────────────────────────────────────────
export function buildWeatherContext(data: WeatherData, city: string, now: Date = new Date()): WeatherContext {
  const temporal = getTemporalContext(now);

  // Use the full scored resolver — temporal context feeds into scores
  const { primary: event, secondary: secondaryEvent } = scoreWeatherSignals(
    data,
    temporal.season,
    temporal.timeOfDay,
    temporal.isWeekend,
  );

  const urgency = computeUrgency(event, temporal.season, temporal.timeOfDay, secondaryEvent);
  const services = rankServices(event, temporal.season, urgency);
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
    precipitation: data.precipitation,
  };
}

// ── Backwards-compatible shim ──
// (middleware and layouts still use weatherMode for CSS theming)
export function eventToCSSMode(event: WeatherEvent): string {
  const map: Record<WeatherEvent, string> = {
    HAIL_STORM: 'weather-storm',
    THUNDERSTORM: 'weather-storm',
    HEAVY_RAIN: 'weather-rain',
    DRIZZLE: 'weather-rain',
    HIGH_WIND: 'weather-storm',
    CLEAR_HOT: 'weather-clear-hot',
    CLEAR_MILD: 'weather-clear',
    OVERCAST: 'weather-overcast',
    FROST: 'weather-frost',
    FOG: 'weather-overcast',
    DEFAULT: 'weather-default',
  };
  return map[event] || 'weather-default';
}
