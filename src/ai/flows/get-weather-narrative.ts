'use server';

/**
 * @fileOverview Generates a conversational weather narrative using AI.
 *
 * - getWeatherNarrative - A function that creates a human-friendly summary of the weather.
 * - GetWeatherNarrativeInput - The input type for the getWeatherNarrative function.
 * - GetWeatherNarrativeOutput - The return type for the getWeatherNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GetWeatherDataOutput } from './get-weather-data';

export type GetWeatherNarrativeInput = GetWeatherDataOutput;

const GetWeatherNarrativeOutputSchema = z.object({
  narrative: z.string().describe('A friendly, conversational summary of the weather conditions and forecast. Should be 2-3 sentences long.'),
});
export type GetWeatherNarrativeOutput = z.infer<typeof GetWeatherNarrativeOutputSchema>;

export async function getWeatherNarrative(input: GetWeatherNarrativeInput): Promise<GetWeatherNarrativeOutput> {
  return getWeatherNarrativeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getWeatherNarrativePrompt',
    input: { schema: z.any() },
    output: { schema: GetWeatherNarrativeOutputSchema },
    prompt: `You are a friendly and enthusiastic weather forecaster.
    
    Based on the following JSON weather data, generate a short, conversational, and engaging weather narrative.
    
    - Keep it to 2-3 sentences.
    - Mention the location, current temperature, and condition.
    - Briefly touch on the forecast for the next day or a notable upcoming change.
    - Your tone should be light and personal.

    Weather Data:
    \`\`\`json
    {{{json input}}}
    \`\`\`
    `,
});

const getWeatherNarrativeFlow = ai.defineFlow(
  {
    name: 'getWeatherNarrativeFlow',
    inputSchema: z.any(),
    outputSchema: GetWeatherNarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt({input});
    return output!;
  }
);
