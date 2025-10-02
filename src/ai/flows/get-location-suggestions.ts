'use server';

/**
 * @fileOverview Provides location suggestions and auto-correction for weather searches.
 *
 * - getLocationSuggestions - A function that returns a list of suggested locations based on user input.
 * - GetLocationSuggestionsInput - The input type for the getLocationSuggestions function.
 * - GetLocationSuggestionsOutput - The return type for the getLocationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocationSuggestionsInputSchema = z.object({
  input: z.string().describe('The partial or misspelled city name entered by the user.'),
});
export type GetLocationSuggestionsInput = z.infer<typeof GetLocationSuggestionsInputSchema>;

const GetLocationSuggestionsOutputSchema = z.object({
    suggestions: z.array(z.string()).describe('A list of suggested city names.'),
});
export type GetLocationSuggestionsOutput = z.infer<typeof GetLocationSuggestionsOutputSchema>;

export async function getLocationSuggestions(input: GetLocationSuggestionsInput): Promise<GetLocationSuggestionsOutput> {
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
    
    const apiKey = "888c6f6d1a152bfd3be977d295ab111f";
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Geocoding API request failed with status ${response.status}`);
            return { suggestions: [] };
        }
        const data = await response.json();
        
        const suggestions = data.map((item: any) => {
            let suggestion = item.name;
            if (item.state) {
                suggestion += `, ${item.state}`;
            }
            if (item.country) {
                suggestion += `, ${item.country}`;
            }
            return suggestion;
        });

        // Remove duplicates
        const uniqueSuggestions = [...new Set(suggestions)];

        return { suggestions: uniqueSuggestions };

    } catch (error) {
        console.error("Failed to fetch suggestions from Geocoding API:", error);
        return { suggestions: [] };
    }
  }
);
