# VibeBranding — AI Brand Identity Generator

Transform your product idea into a complete, production-ready brand identity — naming, visual identity, voice, and launch assets — powered by AI.

**Live at [vibebranding.vercel.app](https://vibebranding.vercel.app)**

---

## What It Does

VibeBranding runs a 9-stage AI-powered pipeline to generate a complete brand system:

| Stage | Module | Output |
|---|---|---|
| 1 | Discovery | Product positioning, competitive analysis, audience persona |
| 2 | Strategy | Jungian archetypes, emotional territory, brand values, tone of voice |
| 3 | Naming | 25 scored candidates, phonetics, memorability, trademark risk |
| 4 | Colour + Typography | WCAG AA palette (6 harmony types), type scale, font pairing |
| 5 | Logo + Visual | Logo concepts, lockups, iconography, motion language |
| 6 | Verbal Identity | Taglines, hero headline, messaging hierarchy, microcopy |
| 7 | Applications | 18+ brand asset specifications (digital, marketing, in-product) |
| 8 | Guidelines | 10-section brand guidelines document (HTML, Markdown, PDF) |
| 9 | Export | CSS tokens, Tailwind v4 config, SCSS variables, Figma styles |

## Tech Stack

- **Framework**: Next.js 16.2 App Router
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5 (strict mode)
- **AI Provider**: Google Gemini 3.5 Flash (text), Replicate + Recraft V4.1 SVG (logos)
- **Auth**: Supabase (magic link + GitHub OAuth)
- **Testing**: Vitest (192+ tests)
- **CI/CD**: GitHub Actions
- **Infrastructure**: Docker, Vercel

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # 192+ unit/integration tests
npm run build      # production build
npm run start      # production server on :3000
```

### Environment Variables

Copy `.env.local.example` to `.env.local`:

```
GEMINI_API_KEY=           # Google Gemini API key (required)
REPLICATE_API_KEY=        # Replicate API key (optional — enables SVG logos)
NEXT_PUBLIC_SUPABASE_URL=  # Supabase project URL (optional — enables auth)
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key (optional — enables auth)
```

## Project Structure

```
src/
├── core/               # Core engine
│   ├── bso/            # Brand State Object (types, schema, store, persistence)
│   ├── prompt-engine/  # AI prompt construction + templates
│   └── consistency-engine/ # Brand Coherence Engine (10 validators)
├── ai/                 # AI layer
│   ├── gemini.ts       # Gemini 3.5 Flash with retry logic
│   └── model-router.ts # Task routing + Replicate image gen
├── modules/            # 10 branding modules
├── export/             # 7 export format generators
├── lib/                # Utility libraries
│   ├── color-theory.ts
│   ├── typography.ts
│   ├── branding-frameworks.ts
│   └── validation.ts
├── app/                # Next.js App Router
│   ├── page.tsx        # Brand wizard UI
│   ├── brand/          # Self-branding showcase
│   ├── dashboard/      # User brand dashboard (Supabase)
│   ├── devlog/         # Devlog/blog + RSS feed
│   └── api/            # API routes
├── components/         # Shared components
│   ├── JsonLd.tsx      # Structured data (SoftwareApplication schema)
│   └── NewsletterSignup.tsx
└── middleware.ts       # Supabase auth middleware
```

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/brand` | POST | Full 9-stage pipeline |
| `/api/brand` | GET | Current BSO state |
| `/api/brand/logo` | POST | Recraft SVG logo generation |
| `/api/brand/export` | POST | Download brand kits (css/tailwind/scss/figma/html/all) |
| `/api/brands` | GET | List user's saved brands (auth required) |
| `/api/brands/[id]` | GET/DELETE | Get/delete specific brand |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run test         # Run tests (vitest)
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)
```

## VibeBranding's Own Brand Identity

VibeBranding was run through its own pipeline. See the full showcase at [/brand](https://vibebranding.vercel.app/brand).

- **Archetypes**: Creator (100%), Sage (85%)
- **Emotional Territory**: Flow-State Craftsmanship
- **Colours**: Blue (#2563EB) → Purple (#7C3AED) → Amber (#F59E0B) — Triadic harmony
- **Typography**: Geist (display) + Geist Text (body) + Geist Mono (code)
- **Voice**: Confident (85%), Precise (90%), Warm (70%), Playful (60%)
- **Tagline**: "Your brand identity, one prompt away."

## Deployment

```bash
npm run build
npx vercel --prod
```

The site is deployed at [vibebranding.vercel.app](https://vibebranding.vercel.app) with automatic deployments from the `master` branch.

### Docker

```bash
docker compose up --build
```

Requires `GEMINI_API_KEY` and `REPLICATE_API_KEY` env vars (via `.env` file or shell).

## License

MIT — built by [Jordan Thirkle](https://github.com/jordan-thirkle).
