import { z } from "zod";
import { WeatherDataSchema } from "@/lib/weather-data";

export const GetWeatherDataInputSchema = z
  .object({
    location: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('The city name to get weather data for (e.g., "London").'),
    lat: z.number().optional().describe("The latitude."),
    lon: z.number().optional().describe("The longitude."),
  })
  .refine(
    (data) =>
      Boolean(data.location) ||
      (typeof data.lat === "number" && typeof data.lon === "number"),
    {
      message: "Either location or both lat and lon must be provided.",
    }
  );

export const GetWeatherDataOutputSchema = WeatherDataSchema;

export type GetWeatherDataInput = z.infer<typeof GetWeatherDataInputSchema>;
export type GetWeatherDataOutput = z.infer<typeof GetWeatherDataOutputSchema>;

export const GetWeatherNarrativeOutputSchema = z.object({
  narrative: z
    .string()
    .min(1)
    .describe(
      "A friendly weather summary. Keep it concise, informative, and under 3 sentences."
    ),
});

export type GetWeatherNarrativeInput = GetWeatherDataOutput;
export type GetWeatherNarrativeOutput = z.infer<
  typeof GetWeatherNarrativeOutputSchema
>;
