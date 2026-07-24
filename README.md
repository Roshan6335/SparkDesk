# SparkDesk

All-in-one AI workspace — Genspark-inspired design, built incrementally.

## Live tools (working now)
- **AI Chat** — `/workspace/chat`
- **AI Notes & Document Generator** — `/workspace/notes`
- **AI Presentation Outliner** — `/workspace/presentation`

Everything else on the workspace grid (`lib/tools.ts`) is marked `status: "soon"` and shows
as a "Coming soon" card. To ship a new tool:
1. Build the API route in `app/api/<slug>/route.ts` (reuse `lib/ai-client.ts`)
2. Build the page in `app/workspace/<slug>/page.tsx`
3. Flip that tool's entry in `lib/tools.ts` to `status: "live"` and add `href`

## Setup

```bash
npm install
cp .env.example .env.local
# fill in GROQ_API_KEY (required) and OPENROUTER_API_KEY (fallback, recommended)
npm run dev
```

## Environment variables (set these in Vercel → Project → Settings → Environment Variables)

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Yes | Primary AI provider |
| `OPENROUTER_API_KEY` | Recommended | Fallback if Groq fails/rate-limits |
| `GROQ_MODEL` | No | Override default Groq model |
| `OPENROUTER_MODEL` | No | Override default OpenRouter model |
| `NEXT_PUBLIC_SITE_URL` | No | Used in OpenRouter request headers |

## Architecture notes

- **All AI calls are server-side only** (`app/api/**/route.ts`) — no API keys ever reach the client.
- `lib/ai-client.ts` — shared completion function: tries Groq first (with retry + backoff),
  falls back to OpenRouter on failure. Also has `repairAndParseJSON()` for tools that need
  structured output (used by the presentation outliner).
- `lib/rate-limit.ts` — simple in-memory per-IP limiter (10 req/min). Resets on cold start;
  swap for Upstash Redis when you outgrow it — call site (`checkRateLimit`) won't change.
- `lib/tools.ts` — single source of truth for the workspace grid. Add/flip tools here.

## Deferred (not built yet)
- Auth (Supabase email-OTP planned, same as Pariksha Saathi)
- Image/video/audio generation tools (need separate provider keys)
- PPTX/DOCX export for generated content
- Upstash Redis rate limiting, Cloudflare Turnstile
