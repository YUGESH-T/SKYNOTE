import type { LucideIcon } from 'lucide-react';
import { Sun, Cloud, CloudRain, Snowflake, Zap, CloudFog, Haze } from 'lucide-react';

export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Thunderstorm' | 'Fog' | 'Haze';

export interface DailyData {
  day: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  humidity: number;
}
export interface WeatherData {
  location: string;
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  sunrise: string;
  sunset: string;
  currentTime: string;
  forecast: DailyData[];
  hourly: HourlyForecast[];
}

export interface Forecast {
  day: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  humidity: number;
}

export interface HourlyForecast {
  time: string;
  condition: WeatherCondition;
  temperature: number;
  windSpeed: number;
  humidity: number;
}

export const weatherIcons: Record<WeatherCondition, LucideIcon> = {
  Sunny: Sun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  Snowy: Snowflake,
  Thunderstorm: Zap,
  Fog: CloudFog,
  Haze: Haze,
};

// Expanded list of locations for better autocomplete suggestions
export const locations: { location: string }[] = [
  { location: 'New York' },
  { location: 'London' },
  { location: 'Tokyo' },
  { location: 'Paris' },
  { location: 'Sydney' },
  { location: 'Los Angeles' },
  { location: 'Chicago' },
  { location: 'Toronto' },
  { location: 'Berlin' },
  { location: 'Moscow' },
  { location: 'Dubai' },
  { location: 'Singapore' },
  { location: 'Hong Kong' },
  { location: 'San Francisco' },
  { location: 'Miami' },
  { location: 'Rome' },
  { location: 'Madrid' },
  { location: 'Barcelona' },
  { location: 'Amsterdam' },
  { location: 'Seoul' },
];
