import { z } from "zod";
import type { WeatherCondition } from "@/lib/weather-data";

const CoordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

const WeatherDescriptorSchema = z.object({
  main: z.string(),
});

const MainMetricsSchema = z.object({
  temp: z.number(),
  feels_like: z.number(),
  humidity: z.number(),
  temp_min: z.number().optional(),
  temp_max: z.number().optional(),
});

const WindSchema = z.object({
  speed: z.number(),
});

const SysSchema = z.object({
  sunrise: z.number(),
  sunset: z.number(),
});

export const OpenWeatherCurrentResponseSchema = z.object({
  coord: CoordinatesSchema,
  weather: z.array(WeatherDescriptorSchema).min(1),
  main: MainMetricsSchema,
  wind: WindSchema,
  sys: SysSchema,
  name: z.string(),
  dt: z.number(),
});

export const OpenWeatherForecastItemSchema = z.object({
  dt: z.number(),
  main: z.object({
    temp: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
  }),
  weather: z.array(WeatherDescriptorSchema).min(1),
  wind: WindSchema,
  pop: z.number().nullable().optional(),
});

export const OpenWeatherForecastResponseSchema = z.object({
  city: z.object({
    timezone: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
    name: z.string(),
  }),
  list: z.array(OpenWeatherForecastItemSchema).min(1),
});

export const OpenWeatherGeocodeResponseSchema = z.array(
  z.object({
    name: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  })
);

export type OpenWeatherCurrentResponse = z.infer<
  typeof OpenWeatherCurrentResponseSchema
>;
export type OpenWeatherForecastResponse = z.infer<
  typeof OpenWeatherForecastResponseSchema
>;
export type OpenWeatherForecastItem = z.infer<
  typeof OpenWeatherForecastItemSchema
>;

export class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export function mapWeatherCondition(main: string): WeatherCondition {
  const mapping: Record<string, WeatherCondition> = {
    Clear: "Sunny",
    Clouds: "Cloudy",
    Rain: "Rainy",
    Drizzle: "Rainy",
    Snow: "Snowy",
    Thunderstorm: "Thunderstorm",
    Mist: "Fog",
    Fog: "Fog",
    Smoke: "Fog",
    Haze: "Haze",
  };

  return mapping[main] ?? "Sunny";
}

export function formatTimeAtOffset(
  timestampSeconds: number,
  timezoneOffsetSeconds: number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    ...options,
  }).format(date);
}

export function formatDateAtOffset(
  timestampSeconds: number,
  timezoneOffsetSeconds: number,
  mode: "full" | "shortDay" | "shortDate" = "full"
): string {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  const optionsByMode: Record<
    typeof mode,
    Intl.DateTimeFormatOptions
  > = {
    full: {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
    shortDay: {
      weekday: "short",
      timeZone: "UTC",
    },
    shortDate: {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  };

  return new Intl.DateTimeFormat("en-US", optionsByMode[mode]).format(date);
}

export function getLocalDayKey(
  timestampSeconds: number,
  timezoneOffsetSeconds: number
): string {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export function toPercentage(value?: number | null): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 100);
}

function mapApiError(status: number): string {
  switch (status) {
    case 401:
      return "Weather service credentials are invalid.";
    case 404:
      return "We couldn't find weather data for that location.";
    case 429:
      return "Weather service rate limit reached. Please try again shortly.";
    default:
      if (status >= 500) {
        return "Weather service is temporarily unavailable. Please try again.";
      }

      return "Weather data could not be loaded right now.";
  }
}

export async function fetchOpenWeatherJson<T>(
  url: string,
  schema: z.ZodSchema<T>,
  init?: NextFetchInit
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        next: {
          revalidate: 300,
          ...init?.next,
        },
      });

      if (!response.ok) {
        throw new WeatherApiError(mapApiError(response.status));
      }

      const json = await response.json();
      return schema.parse(json);
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof Error && error.name === "AbortError";
      const shouldRetry =
        attempt === 0 &&
        (isAbort || !(error instanceof WeatherApiError));

      if (!shouldRetry) {
        break;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError instanceof WeatherApiError) {
    throw lastError;
  }

  throw new WeatherApiError(
    "Weather service did not respond in time. Please try again."
  );
}
