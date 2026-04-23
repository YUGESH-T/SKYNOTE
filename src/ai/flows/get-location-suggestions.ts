'use server';

/**
 * @fileOverview Provides location suggestions and auto-correction for weather searches.
 */

import { ai } from '@/ai/genkit';
import { env } from '@/lib/env';
import {
  fetchOpenWeatherJson,
  OpenWeatherGeocodeResponseSchema,
} from '@/lib/openweather';
import {
  GetLocationSuggestionsInputSchema,
  GetLocationSuggestionsOutputSchema,
  type GetLocationSuggestionsInput,
  type GetLocationSuggestionsOutput,
} from './location-contracts';

export async function getLocationSuggestions(
  input: GetLocationSuggestionsInput
): Promise<GetLocationSuggestionsOutput> {
  return getLocationSuggestionsFlow(input);
}

const getLocationSuggestionsFlow = ai.defineFlow(
  {
    name: 'getLocationSuggestionsFlow',
    inputSchema: GetLocationSuggestionsInputSchema,
    outputSchema: GetLocationSuggestionsOutputSchema,
  },
  async ({ input }) => {
    if (input.length < 2) {
      return { suggestions: [] };
    }

    const apiKey = env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input.trim())}&limit=5&appid=${apiKey}`;

    try {
      const data = await fetchOpenWeatherJson(url, OpenWeatherGeocodeResponseSchema);

      const suggestions = data
        .map((item) => {
          const name = item.name?.trim();
          if (!name) return null;

          const parts = [name];
          if (item.state?.trim()) parts.push(item.state.trim());
          if (item.country?.trim()) parts.push(item.country.trim());

          return parts.join(', ');
        })
        .filter((value): value is string => Boolean(value));

      return { suggestions: Array.from(new Set(suggestions)) };
    } catch {
      return { suggestions: [] };
    }
  }
);
