# SKYNOTE

SKYNOTE is a Next.js weather dashboard that combines OpenWeather data, an optional AI summary, and a Three.js background scene tuned to the current forecast.

[Live Demo - Open SKYNOTE](https://skynote-neon.vercel.app/)

## What It Does

- Shows current conditions, sunrise/sunset, hourly outlook, and a 5-day forecast.
- Generates a concise AI weather summary with a deterministic fallback when AI is unavailable.
- Uses location lookup, geolocation bootstrap, recent searches, and a persisted Celsius/Fahrenheit preference.
- Falls back to a lightweight gradient scene on reduced-motion, mobile, or unsupported WebGL environments.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Genkit with Google AI
- OpenWeather APIs
- Three.js
- Tailwind CSS + shadcn/ui
- Recharts

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Add `GEMINI_API_KEY` and `OPENWEATHER_API_KEY`.
3. Install dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- API keys are server-only and must not use `NEXT_PUBLIC_`.
- The forecast view is intentionally labeled as a 5-day outlook because it is derived from OpenWeather's shorter-range forecast feed.
- If older keys were ever committed, rotate them before deploying.
