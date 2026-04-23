import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudFog,
  CloudRain,
  Haze,
  Snowflake,
  Sun,
  Zap,
} from "lucide-react";
import { z } from "zod";

export type WeatherCondition =
  | "Sunny"
  | "Cloudy"
  | "Rainy"
  | "Snowy"
  | "Thunderstorm"
  | "Fog"
  | "Haze";

export type TemperatureUnit = "celsius" | "fahrenheit";
export type TimeOfDay = "morning" | "afternoon" | "night";

export const WeatherConditionSchema = z.enum([
  "Sunny",
  "Cloudy",
  "Rainy",
  "Snowy",
  "Thunderstorm",
  "Fog",
  "Haze",
]);

export const TimeOfDaySchema = z.enum(["morning", "afternoon", "night"]);

export const HourlyForecastSchema = z.object({
  time: z.string(),
  condition: WeatherConditionSchema,
  temperatureC: z.number(),
  windSpeedKph: z.number(),
  humidity: z.number(),
  precipitationChance: z.number().nullable(),
});

export const DailyDataSchema = z.object({
  day: z.string(),
  dateLabel: z.string(),
  condition: WeatherConditionSchema,
  tempHighC: z.number(),
  tempLowC: z.number(),
  humidity: z.number(),
  precipitationChance: z.number().nullable(),
});

export const WeatherDataSchema = z.object({
  location: z.string(),
  condition: WeatherConditionSchema,
  timeOfDay: TimeOfDaySchema,
  localHour: z.number().int().min(0).max(23),
  temperatureC: z.number(),
  feelsLikeC: z.number(),
  humidity: z.number(),
  windSpeedKph: z.number(),
  precipitationChance: z.number().nullable(),
  sunrise: z.string(),
  sunset: z.string(),
  currentTime: z.string(),
  currentDateLabel: z.string(),
  timezoneOffset: z.number(),
  forecast: z.array(DailyDataSchema),
  hourly: z.array(HourlyForecastSchema),
  lastUpdated: z.number(),
});

export type DailyData = z.infer<typeof DailyDataSchema>;
export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;
export type WeatherData = z.infer<typeof WeatherDataSchema>;

export const weatherIcons: Record<WeatherCondition, LucideIcon> = {
  Sunny: Sun,
  Cloudy: Cloud,
  Rainy: CloudRain,
  Snowy: Snowflake,
  Thunderstorm: Zap,
  Fog: CloudFog,
  Haze,
};

export function celsiusToFahrenheit(value: number): number {
  return Math.round((value * 9) / 5 + 32);
}

export function formatTemperature(
  valueCelsius: number,
  unit: TemperatureUnit
): string {
  const value =
    unit === "fahrenheit"
      ? celsiusToFahrenheit(valueCelsius)
      : Math.round(valueCelsius);
  const suffix = unit === "fahrenheit" ? "°F" : "°C";

  return `${value}${suffix}`;
}

export function formatWindSpeed(
  valueKph: number,
  unit: TemperatureUnit
): string {
  if (unit === "fahrenheit") {
    return `${Math.round(valueKph / 1.609)} mph`;
  }

  return `${Math.round(valueKph)} km/h`;
}
