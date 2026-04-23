import { z } from "zod";

export const GetLocationSuggestionsInputSchema = z.object({
  input: z
    .string()
    .describe("The partial or misspelled city name entered by the user."),
});

export const GetLocationSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe("A list of suggested city names."),
});

export type GetLocationSuggestionsInput = z.infer<
  typeof GetLocationSuggestionsInputSchema
>;
export type GetLocationSuggestionsOutput = z.infer<
  typeof GetLocationSuggestionsOutputSchema
>;
