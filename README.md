# website-redesigner

URL in → redesigned Next.js + Tailwind landing page out.

## Structure

- `apps/api` — Fastify orchestrator: `POST /generate`, `GET /jobs/:id`, `GET /preview/:id`, `GET /export/:id`
- `apps/web` — Next.js UI: URL form + Sandpack live preview + ZIP download
- `packages/scraper` — Playwright + Cheerio scrape → `RawScrape`
- `packages/extractor` — Claude (Sonnet) structured JSON, zod-validated, retry-once, partial-fill fallback
- `packages/assets` — download + re-host to Backblaze B2 (S3-compatible), local fallback, placeholder for missing hero
- `packages/components` — hero (A/B/C), services (A/B), testimonials, cta, footer — props-driven
- `packages/assembler` — variant picker + emits a full Next.js project as `Record<path, contents>`
- `packages/exporter` — zips the emitted project
- `packages/schema` — shared zod schemas and TS types

## Setup

```bash
cp .env.example .env         # add ANTHROPIC_API_KEY, and B2 creds if you want asset re-hosting
npm install
npx playwright install chromium
npm run dev:api              # terminal 1
npm run dev:web              # terminal 2
```

Open <http://localhost:3000>.

## Pipeline

`URL → scrape → structure (Claude) → rehost assets → pickVariants → emit project files → Sandpack preview → ZIP export`

## MVP status

Phases 1–5, 5.5, and 6 (zip). Phases 5.6 (iterative refinement) and 6 (GitHub/Vercel push) are v1.1.
