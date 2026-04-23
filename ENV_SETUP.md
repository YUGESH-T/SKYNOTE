# Environment Setup

SKYNOTE now expects server-only environment variables. Do not use `NEXT_PUBLIC_*` keys for API secrets.

## Required Variables

`GEMINI_API_KEY`
Google AI Studio API key used by Genkit for the weather summary.

`OPENWEATHER_API_KEY`
OpenWeather API key used for current weather, forecast, and location lookup.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Replace the placeholder values with your real API keys.
3. Restart the Next.js dev server after changing env values.

## Security Notes

- The previously committed keys should be treated as compromised and rotated in the provider dashboards.
- Keep `.env.local` uncommitted.
- Only the server reads these values now, so they must not be prefixed with `NEXT_PUBLIC_`.

## Verification

Run the following after setting keys:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```
