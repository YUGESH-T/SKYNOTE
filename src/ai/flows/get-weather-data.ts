'use server';

/**
 * @fileOverview Retrieves weather data for a specified location from the OpenWeather API.
 */

import type { z } from "zod";
import { ai } from "@/ai/genkit";
import {
  DailyDataSchema,
  type DailyData,
  HourlyForecastSchema,
  type HourlyForecast,
  type TimeOfDay,
  WeatherDataSchema,
} from "@/lib/weather-data";
import { env } from "@/lib/env";
import {
  fetchOpenWeatherJson,
  formatDateAtOffset,
  formatTimeAtOffset,
  getLocalDayKey,
  mapWeatherCondition,
  OpenWeatherCurrentResponseSchema,
  OpenWeatherForecastResponseSchema,
  toPercentage,
} from "@/lib/openweather";
import {
  GetWeatherDataInputSchema,
  GetWeatherDataOutputSchema,
  type GetWeatherDataInput,
  type GetWeatherDataOutput,
} from "./weather-contracts";

function encodeLocation(location: string): string {
  return encodeURIComponent(location.trim());
}

function buildWeatherUrl(input: GetWeatherDataInput): string {
  const apiKey = env.OPENWEATHER_API_KEY;

  if (input.location) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${encodeLocation(
      input.location
    )}&appid=${apiKey}&units=metric`;
  }

  return `https://api.openweathermap.org/data/2.5/weather?lat=${input.lat}&lon=${input.lon}&appid=${apiKey}&units=metric`;
}

function buildForecastUrl(lat: number, lon: number): string {
  return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}&units=metric`;
}

function getLocalHour(timestamp: number, timezoneOffset: number): number {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.getUTCHours();
}

function getTimeOfDay(localHour: number): TimeOfDay {
  if (localHour >= 5 && localHour < 12) {
    return "morning";
  }

  if (localHour >= 12 && localHour < 18) {
    return "afternoon";
  }

  return "night";
}

type ForecastItem = z.infer<typeof OpenWeatherForecastResponseSchema>["list"][number];

function buildHourlyForecast(
  forecastItems: ForecastItem[],
  timezoneOffset: number
): HourlyForecast[] {
  return forecastItems.slice(0, 8).map((item) =>
    HourlyForecastSchema.parse({
      time: formatTimeAtOffset(item.dt, timezoneOffset, {
        hour: "numeric",
        hour12: true,
      }),
      condition: mapWeatherCondition(item.weather[0].main),
      temperatureC: Math.round(item.main.temp),
      windSpeedKph: Math.round(item.wind.speed * 3.6),
      humidity: Math.round(item.main.humidity),
      precipitationChance: toPercentage(item.pop),
    })
  );
}

function buildDailyForecast(
  forecastItems: ForecastItem[],
  timezoneOffset: number
): DailyData[] {
  const buckets = new Map<
    string,
    {
      timestamp: number;
      tempHigh: number;
      tempLow: number;
      humidityTotal: number;
      entryCount: number;
      precipitationChance: number | null;
      conditionCounts: Record<string, number>;
    }
  >();

  for (const item of forecastItems) {
    const key = getLocalDayKey(item.dt, timezoneOffset);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.tempHigh = Math.max(bucket.tempHigh, item.main.temp_max);
      bucket.tempLow = Math.min(bucket.tempLow, item.main.temp_min);
      bucket.humidityTotal += item.main.humidity;
      bucket.entryCount += 1;
      bucket.precipitationChance = Math.max(
        bucket.precipitationChance ?? 0,
        toPercentage(item.pop) ?? 0
      );
      bucket.conditionCounts[item.weather[0].main] =
        (bucket.conditionCounts[item.weather[0].main] ?? 0) + 1;
    } else {
      buckets.set(key, {
        timestamp: item.dt,
        tempHigh: item.main.temp_max,
        tempLow: item.main.temp_min,
        humidityTotal: item.main.humidity,
        entryCount: 1,
        precipitationChance: toPercentage(item.pop),
        conditionCounts: {
          [item.weather[0].main]: 1,
        },
      });
    }
  }

  return Array.from(buckets.values())
    .slice(0, 5)
    .map((bucket) => {
      const dominantCondition =
        Object.entries(bucket.conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "Clear";

      return DailyDataSchema.parse({
        day: formatDateAtOffset(bucket.timestamp, timezoneOffset, "shortDay"),
        dateLabel: formatDateAtOffset(
          bucket.timestamp,
          timezoneOffset,
          "shortDate"
        ),
        condition: mapWeatherCondition(dominantCondition),
        tempHighC: Math.round(bucket.tempHigh),
        tempLowC: Math.round(bucket.tempLow),
        humidity: Math.round(bucket.humidityTotal / bucket.entryCount),
        precipitationChance: bucket.precipitationChance,
      });
    });
}

export async function getWeatherData(
  input: GetWeatherDataInput
): Promise<GetWeatherDataOutput> {
  return getWeatherDataFlow(input);
}

const getWeatherDataFlow = ai.defineFlow(
  {
    name: "getWeatherDataFlow",
    inputSchema: GetWeatherDataInputSchema,
    outputSchema: GetWeatherDataOutputSchema,
  },
  async (input) => {
    const weatherData = await fetchOpenWeatherJson(
      buildWeatherUrl(input),
      OpenWeatherCurrentResponseSchema
    );

    const latitude = input.lat ?? weatherData.coord.lat;
    const longitude = input.lon ?? weatherData.coord.lon;

    const forecastData = await fetchOpenWeatherJson(
      buildForecastUrl(latitude, longitude),
      OpenWeatherForecastResponseSchema
    );

    const timezoneOffset = forecastData.city.timezone;
    const localHour = getLocalHour(weatherData.dt, timezoneOffset);
    const hourly = buildHourlyForecast(forecastData.list, timezoneOffset);
    const forecast = buildDailyForecast(forecastData.list, timezoneOffset);

    return WeatherDataSchema.parse({
      location: weatherData.name || forecastData.city.name || "Current Location",
      condition: mapWeatherCondition(weatherData.weather[0].main),
      timeOfDay: getTimeOfDay(localHour),
      localHour,
      temperatureC: Math.round(weatherData.main.temp),
      feelsLikeC: Math.round(weatherData.main.feels_like),
      humidity: Math.round(weatherData.main.humidity),
      windSpeedKph: Math.round(weatherData.wind.speed * 3.6),
      precipitationChance:
        hourly.reduce(
          (max, item) => Math.max(max, item.precipitationChance ?? 0),
          0
        ) || null,
      sunrise: formatTimeAtOffset(weatherData.sys.sunrise, timezoneOffset),
      sunset: formatTimeAtOffset(weatherData.sys.sunset, timezoneOffset),
      currentTime: formatTimeAtOffset(weatherData.dt, timezoneOffset),
      currentDateLabel: formatDateAtOffset(
        weatherData.dt,
        timezoneOffset,
        "full"
      ),
      timezoneOffset,
      forecast,
      hourly,
      lastUpdated: Date.now(),
    });
  }
);
