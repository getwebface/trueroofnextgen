export type WeatherMode = 'STORM_EMERGENCY' | 'RAIN_ACTIVE' | 'PREVENTATIVE' | 'ROOF_REPLACEMENT' | 'DEFAULT';

export interface WeatherData {
  windSpeed: number; // km/h
  precipitation: number; // mm
  temperature: number; // Celsius
  condition: string; // e.g., 'Clear', 'Rain', 'Hail'
}

export function determineWeatherMode(data: WeatherData, date: Date = new Date()): WeatherMode {
  const isAutumn = date.getMonth() >= 2 && date.getMonth() <= 4; // March to May in Australia

  if (data.windSpeed > 60 || data.condition.toLowerCase().includes('hail')) {
    return 'STORM_EMERGENCY';
  }

  if (data.precipitation > 0 || data.condition.toLowerCase().includes('rain')) {
    return 'RAIN_ACTIVE';
  }

  if (data.temperature < 10 || isAutumn) {
    return 'PREVENTATIVE';
  }

  if (data.temperature >= 15 && data.temperature <= 25 && data.condition.toLowerCase().includes('clear')) {
    return 'ROOF_REPLACEMENT';
  }

  return 'DEFAULT';
}
