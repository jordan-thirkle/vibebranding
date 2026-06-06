# VibeBranding — Project Guide

## What This Is
VibeBranding is an AI-driven brand identity generation platform for vibe-coded products, indie apps, SaaS tools, and developer-built projects. It transforms a raw concept into a complete, coherent, production-ready brand system — naming, visual identity, voice, motion, and launch assets.

## Tech Stack
- **Framework**: Next.js 16.2 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5 (strict mode)
- **AI Provider**: Google Gemini 2.5 Pro/Flash
- **Package Manager**: npm
- **Deployment**: Vercel

## Project Structure
```
VibeBranding/
├── opencode.json                    # OpenCode project config
├── .opencode/
│   ├── agents/                      # 12 custom subagents
│   ├── skills/                      # 3 custom skills
│   ├── commands/                    # 6 custom commands
│   └── plugins/                     # Custom plugins
├── src/
│   ├── core/                        # Core engine
│   │   ├── bso/                     # Brand State Object
│   │   ├── prompt-engine/           # Prompt construction
│   │   └── consistency-engine/      # BCE validation
│   ├── modules/                     # Branding modules
│   │   ├── discovery/
│   │   ├── strategy/
│   │   ├── naming/
│   │   ├── color/
│   │   ├── typography/
│   │   ├── logo/
│   │   ├── iconography/
│   │   ├── illustration/
│   │   ├── motion/
│   │   ├── verbal/
│   │   ├── applications/
│   │   └── guidelines/
│   ├── ai/                          # AI integration
│   │   ├── gemini.ts
│   │   ├── model-router.ts
│   │   └── post-process/
│   ├── export/                      # Export formats
│   │   ├── css-tokens.ts
│   │   ├── tailwind.ts
│   │   ├── scss.ts
│   │   ├── figma.ts
│   │   ├── pdf.ts
│   │   └── zip.ts
│   ├── ui/                          # UI components (Phase 4)
│   │   ├── components/
│   │   └── app/
│   └── lib/                         # Utility libraries
│       ├── color-theory.ts
│       ├── typography.ts
│       ├── branding-frameworks.ts
│       └── validation.ts
└── exports/                         # Generated brand kits
```

## Available Agents
| Agent | Purpose | When to Use |
|---|---|---|
| `brand-discovery` | Gather product context, audience, positioning | Stage 1 |
| `brand-strategist` | Archetypes, personality, values, tone | Stage 2 |
| `brand-namer` | Name generation + validation | Stage 3 |
| `color-theorist` | Colour system + tokens | Stage 4 |
| `typographer` | Font selection + type scale | Stage 4 |
| `logo-designer` | Logo generation pipeline | Stage 5 |
| `iconographer` | Icon system generation | Stage 5 |
| `illustrator` | Illustration style | Stage 5 |
| `motion-designer` | Animation language | Stage 5 |
| `copywriter` | Verbal identity | Stage 6 |
| `consistency-checker` | Brand Coherence Engine | Validation gates |
| `asset-exporter` | Export brand kits | Stage 8-9 |

## Available Skills
- `brand-generation` — Full 9-stage workflow + BSO schema
- `color-harmony` — Colour theory algorithms
- `typographic-systems` — Type scales + font pairing

## Available MCPs
- `playwright` — Browser automation for competitive analysis
- `brave-search` — Web search for research
- `context7` — Documentation search

## Custom Commands
- `/brand-full` — Full pipeline
- `/brand-strategy` — Discovery + Strategy only
- `/brand-visual` — Visual identity only
- `/brand-verbal` — Naming + Copywriting only
- `/brand-export` — Export brand kit
- `/brand-validate` — Run BCE validation

## Coding Conventions
- All new files in TypeScript with strict mode
- Use `@/*` import alias for `src/*`
- Server components by default; `'use client'` only when needed
- API routes in `src/app/api/`
- Zod for runtime validation of BSO and API inputs
- No `any` types — use proper interfaces
- Test files alongside source: `*.test.ts`

## Key Rules
- **Core engine first** — BSO, Prompt Engine, BCE before any UI
- **Read Next.js docs** — Check `node_modules/next/dist/docs/` for v16 breaking changes before writing app code
- **No scope creep** — One module at a time
- **Validate before proceeding** — Run BCE after each stage
- **Commit working code** — Small, frequent commits with clear messages

## Environment Variables
```
GEMINI_API_KEY=           # Google Gemini API key
BRAVE_API_KEY=            # Brave Search API key (for competitive analysis MCP)
```

## Getting Started
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # Lint check
```
