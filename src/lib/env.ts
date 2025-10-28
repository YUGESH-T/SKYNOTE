
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENWEATHER_API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
});
