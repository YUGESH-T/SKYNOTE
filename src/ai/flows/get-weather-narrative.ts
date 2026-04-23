'use server';

/**
 * @fileOverview Generates a conversational weather narrative using AI.
 */

import { ai } from '@/ai/genkit';
import {
  GetWeatherDataOutputSchema,
  GetWeatherNarrativeOutputSchema,
  type GetWeatherNarrativeInput,
  type GetWeatherNarrativeOutput,
} from './weather-contracts';

function buildFallbackNarrative(input: GetWeatherNarrativeInput): string {
  const tomorrow = input.forecast[1] ?? input.forecast[0];
  const forecastLine = tomorrow
    ? `Expect ${tomorrow.condition.toLowerCase()} conditions around ${tomorrow.tempHighC}°C and ${tomorrow.tempLowC}°C next.`
    : 'Forecast updates will appear here as more data becomes available.';

  return `${input.location} is currently ${input.temperatureC}°C with ${input.condition.toLowerCase()} skies. ${forecastLine}`;
}

export async function getWeatherNarrative(
  input: GetWeatherNarrativeInput
): Promise<GetWeatherNarrativeOutput> {
  try {
    const result = await getWeatherNarrativeFlow(input);
    const narrative = result.narrative.trim();

    if (!narrative) {
      return { narrative: buildFallbackNarrative(input) };
    }

    return { narrative };
  } catch {
    return { narrative: buildFallbackNarrative(input) };
  }
}

const prompt = ai.definePrompt({
  name: 'getWeatherNarrativePrompt',
  input: { schema: GetWeatherDataOutputSchema },
  output: { schema: GetWeatherNarrativeOutputSchema },
  prompt: `You are a concise weather assistant.

Summarize the weather in 2 short sentences.
- Mention the location, current condition, and current temperature in Celsius.
- Mention one practical next-step forecast detail from the upcoming outlook.
- Avoid hype, repetition, emojis, and filler.
- Return plain text only.

Weather data:
{{{json input}}}`,
});

const getWeatherNarrativeFlow = ai.defineFlow(
  {
    name: 'getWeatherNarrativeFlow',
    inputSchema: GetWeatherDataOutputSchema,
    outputSchema: GetWeatherNarrativeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    return {
      narrative: output?.narrative?.trim() || buildFallbackNarrative(input),
    };
  }
);
