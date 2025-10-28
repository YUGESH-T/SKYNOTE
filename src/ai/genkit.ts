import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { env } from "@/lib/env";

export const ai = genkit({
  plugins: [googleAI({ apiKey: env.NEXT_PUBLIC_GEMINI_API_KEY, apiVersion: "v1" })],
  model: "googleai/gemini-2.5-flash",
});
