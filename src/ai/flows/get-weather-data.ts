
'use server';

/**
 * @fileOverview Retrieves weather data for a specified location from the OpenWeatherMap API.
 *
 * - getWeatherData - A function that fetches weather data for a given location.
 * - GetWeatherDataInput - The input type for the getWeatherData function.
 * - GetWeatherDataOutput - The return type for the getWeatherData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';
import type { WeatherCondition } from '@/lib/weather-data';

const GetWeatherDataInputSchema = z.object({
  location: z.string().optional().describe('The city name to get weather data for (e.g., "London").'),
  lat: z.number().optional().describe('The latitude.'),
  lon: z.number().optional().describe('The longitude.'),
}).refine(data => data.location || (typeof data.lat === 'number' && typeof data.lon === 'number'), {
    message: "Either location or both lat and lon must be provided.",
});
export type GetWeatherDataInput = z.infer<typeof GetWeatherDataInputSchema>;

const DailyDataSchema = z.object({
    day: z.string().describe("Day of the week (e.g., 'Tue')."),
    condition: z.enum(['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Thunderstorm', 'Fog', 'Haze']),
    tempHigh: z.number().describe("Highest temperature for the day in Celsius."),
    tempLow: z.number().describe("Lowest temperature for the day in Celsius."),
    humidity: z.number().describe("Average humidity percentage for the day."),
});

const GetWeatherDataOutputSchema = z.object({
    location: z.string(),
    condition: z.enum(['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Thunderstorm', 'Fog', 'Haze']),
    temperature: z.number().describe("Temperature in Celsius."),
    feelsLike: z.number().describe("The 'feels like' temperature in Celsius, considering factors like humidity and wind."),
    humidity: z.number().describe("Humidity percentage."),
    windSpeed: z.number().describe("Wind speed in km/h."),
    sunrise: z.string().describe("Sunrise time (e.g., '6:30 AM')."),
    sunset: z.string().describe("Sunset time (e.g., '7:45 PM')."),
    currentTime: z.string().describe("Current local time (e.g., '2:30 PM')."),
    forecast: z.array(DailyDataSchema).describe("A 7-day weather forecast."),
    hourly: z.array(z.object({
        time: z.string().describe("The hour for the forecast (e.g., '3pm')."),
        condition: z.enum(['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Thunderstorm', 'Fog', 'Haze']),
        temperature: z.number().describe("Temperature for the hour in Celsius."),
        windSpeed: z.number().describe("Wind speed in km/h for the hour."),
        humidity: z.number().describe("Humidity percentage for the hour."),
    })).describe("A 24-hour weather forecast."),
});
export type GetWeatherDataOutput = z.infer<typeof GetWeatherDataOutputSchema>;

export async function getWeatherData(input: GetWeatherDataInput): Promise<GetWeatherDataOutput> {
  return getWeatherDataFlow(input);
}

function mapWeatherCondition(main: string): WeatherCondition {
    const mapping: Record<string, WeatherCondition> = {
        'Clear': 'Sunny',
        'Clouds': 'Cloudy',
        'Rain': 'Rainy',
        'Drizzle': 'Rainy',
        'Snow': 'Snowy',
        'Thunderstorm': 'Thunderstorm',
        'Mist': 'Fog',
        'Fog': 'Fog',
        'Haze': 'Haze'
    };
    return mapping[main] || 'Sunny';
}

function formatTimeFromTimestamp(timestamp: number, timezoneOffset: number, options?: Intl.DateTimeFormatOptions): string {
  try {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    };
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  } catch (e) {
    console.error('Error formatting time:', e);
    return 'N/A';
  }
}

const getWeatherDataFlow = ai.defineFlow(
  {
    name: 'getWeatherDataFlow',
    inputSchema: GetWeatherDataInputSchema,
    outputSchema: GetWeatherDataOutputSchema,
  },
  async ({ location, lat, lon }) => {
    const apiKey = "888c6f6d1a152bfd3be977d295ab111f";
    
    let weatherUrl: string;
    if (location) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    } else if (lat !== undefined && lon !== undefined) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        throw new Error("Either location or both lat and lon must be provided.");
    }
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
        const errorBody = await weatherResponse.text();
        throw new Error(`OpenWeather API request failed with status ${weatherResponse.status}: ${errorBody}`);
    }
    const weatherData = await weatherResponse.json();

    const { coord, name: locationName } = weatherData;
    const latitude = lat ?? coord.lat;
    const longitude = lon ?? coord.lon;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
     if (!forecastResponse.ok) {
        const errorBody = await forecastResponse.text();
        throw new Error(`OpenWeather Forecast API request failed with status ${forecastResponse.status}: ${errorBody}`);
    }
    const forecastData = await forecastResponse.json();

    const timezoneOffset = forecastData.city.timezone;
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const hourly = forecastData.list
        .filter((h: any) => {
             const forecastDate = new Date(h.dt * 1000);
             return forecastDate <= twentyFourHoursFromNow;
        })
        .slice(0, 8) // Limit to 8 entries (24 hours in 3-hour intervals)
        .map((h: any) => ({
            time: formatTimeFromTimestamp(h.dt, timezoneOffset, { hour: 'numeric', hour12: true }),
            condition: mapWeatherCondition(h.weather[0].main),
            temperature: Math.round(h.main.temp),
            windSpeed: Math.round(h.wind.speed * 3.6),
            humidity: Math.round(h.main.humidity),
        }));

    const dailyForecasts: { [key: string]: DailyData } = {};
    forecastData.list.forEach((item: any) => {
        const day = format(new Date(item.dt * 1000), 'EEE');
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                day,
                condition: mapWeatherCondition(item.weather[0].main),
                tempHigh: -Infinity,
                tempLow: Infinity,
                humidity: 0,
            };
        }
        dailyForecasts[day].tempHigh = Math.max(dailyForecasts[day].tempHigh, item.main.temp_max);
        dailyForecasts[day].tempLow = Math.min(dailyForecasts[day].tempLow, item.main.temp_min);
        dailyForecasts[day].humidity = (dailyForecasts[day].humidity + item.main.humidity) / 2;
    });

    const forecast = Object.values(dailyForecasts).slice(0, 7).map(day => ({
        ...day,
        tempHigh: Math.round(day.tempHigh),
        tempLow: Math.round(day.tempLow),
        humidity: Math.round(day.humidity),
    }));

    const transformedData: GetWeatherDataOutput = {
        location: locationName || 'Current Location',
        condition: mapWeatherCondition(weatherData.weather[0].main),
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: Math.round(weatherData.main.humidity),
        windSpeed: Math.round(weatherData.wind.speed * 3.6),
        sunrise: formatTimeFromTimestamp(weatherData.sys.sunrise, timezoneOffset),
        sunset: formatTimeFromTimestamp(weatherData.sys.sunset, timezoneOffset),
        currentTime: formatTimeFromTimestamp(weatherData.dt, timezoneOffset),
        forecast: forecast,
        hourly: hourly,
    };

    return transformedData;
  }
);
