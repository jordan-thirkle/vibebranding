# VibeBranding — Production Roadmap

> Generated 2026-06-09 after full audit (19 issues fixed, build ✅, 221 tests ✅)
> Current state: MVP complete — real AI pipeline, Stripe billing, auth, brand persistence

---

## Phase 0 — Ship It 🚀 (Right now — 1 day)

| # | Task | Why | Depends on |
|---|---|---|---|
| 0.1 | **Set `SUPABASE_SERVICE_ROLE_KEY`** in Vercel env vars | Stripe webhooks silently fail without it | — |
| 0.2 | **Run migration** on Supabase (`profiles` table) | 6 API routes crash without it | 0.1 |
| 0.3 | **Deploy to Vercel** — verify everything boots | Production smoke test | 0.1, 0.2 |
| 0.4 | **Test checkout flow** end-to-end | Verify stripe.webhook → profile upsert → plan limit enforcement | 0.1–0.3 |
| 0.5 | **Test auth callback** (Google OAuth + magic link) | Profile auto-creation on first login | 0.2 |
| 0.6 | **Run first real AI pipeline** in prod | Verify Gemini/Groq fallback works | 0.3 |

---

## Phase 1 — Observability (2 days)

| # | Task | Effort | Why |
|---|---|---|---|
| 1.1 | **Add Sentry** (`@sentry/nextjs`) | 2h | Currently all errors are `console.error` — lost in serverless logs |
| 1.2 | **Replace `console.log`** with structured logger (pino) | 1h | Webhook handlers log to stdout — no searchability |
| 1.3 | **Add rate limiting** to API routes | 3h | No protection against abuse — `/api/brand` is expensive |
| 1.4 | **Gemini quota dashboard** (debug endpoint + admin page) | 2h | `gemini-3.1-flash-lite` daily limit unknown — need visibility |
| 1.5 | **Health check endpoint** (`GET /api/health`) | 30m | Vercel + Docker healthcheck currently has no endpoint to hit |

---

## Phase 2 — Test Coverage (2 days)

| # | Task | Tests to write | Current coverage |
|---|---|---|---|
| 2.1 | **Stripe routes** | `create-checkout`, `webhook`, `plan`, `portal` | **0%** — none exist |
| 2.2 | **AI fallback** | `groq.ts`, `fallback.ts`, `model-router.ts` | **0%** — none exist |
| 2.3 | **Brand persistence** | `brand-persistence.ts` | **0%** — none exist |
| 2.4 | **Input normalization** | `normaliseCompetitors()`, `input-schema.ts` | **0%** — just added |
| 2.5 | **Env validation** | `env.ts` | **0%** — none exist |
| 2.6 | **Pipeline integration** (mock data) | Full `POST /api/brand` with mock flag | **0%** — none exist |

---

## Phase 3 — UX & Polish (3 days)

| # | Task | Priority | Details |
|---|---|---|---|
| 3.1 | **Brand list page** (dashboard) | P0 | Currently shows skeleton — needs real brand history loading |
| 3.2 | **Brand detail page** | P1 | View/download a single generated brand |
| 3.3 | **Toast notifications** | P1 | Save success, export complete, error states |
| 3.4 | **Upgrade prompts** | P0 | "You've used 3/3 free brands — upgrade to Pro" in nav |
| 3.5 | **Responsive audit** | P1 | Ensure all pages work on mobile |
| 3.6 | **404 page** | P2 | Brand not found, page not found |
| 3.7 | **Loading states** for pipeline | P1 | Per-stage progress instead of single spinner |
| 3.8 | **OG images** for brand pages | P2 | Social cards when sharing brands |

---

## Phase 4 — Revenue & Retention (5 days)

| # | Task | Effort | Revenue impact |
|---|---|---|---|
| 4.1 | **Stripe reconciliation cron** (`/api/cron/sync-subscriptions`) | 3h | **High** — catch missed webhooks, prevent revenue loss |
| 4.2 | **Brand limit UI** — show `3/50 used` in nav | 2h | **High** — converts free→pro users |
| 4.3 | **PDF export** polish | 4h | **Medium** — core Pro feature |
| 4.4 | **Email notifications** | 4h | **Medium** — brand ready, subscription expired |
| 4.5 | **Shareable brand links** | 3h | **Medium** — viral distribution |
| 4.6 | **Annual billing discount** (20% off) | 2h | **High** — increases LTV |
| 4.7 | **Free trial** (7-day Pro) | 3h | **High** — converts users before they hit free limit |

---

## Phase 5 — Platform Features (7–10 days)

| # | Task | Effort | Why |
|---|---|---|---|
| 5.1 | **User preferences page** | 2d | Manage subscription, API keys, profile |
| 5.2 | **API tokens** for programmatic access | 3d | Unlock "Unlimited" plan value prop |
| 5.3 | **Brand version history** | 2d | Rollback to previous iterations |
| 5.4 | **Multi-brand comparison** | 2d | Side-by-side brand identity comparison |
| 5.5 | **Custom brand guidelines domain** | 1d | White-label for Pro+ users |
| 5.6 | **Team collaboration** (shared brands) | 4d | Enterprise upsell |

---

## Phase 6 — Scale & Performance (Ongoing)

| # | Task | Expected gain |
|---|---|---|
| 6.1 | **Response streaming** for pipeline | From 26s P95 → first render in 3s (chunked) |
| 6.2 | **ISR for static brand pages** | Faster loads for published brands |
| 6.3 | **Database connection pooling** | Reduce cold starts, scale to 100+ concurrent users |
| 6.4 | **CDN for export assets** | Fast ZIP/PDF downloads globally |
| 6.5 | **Edge-cache logo SVGs** | Sub-ms logo delivery |

---

### Architecture Decisions Locked In

| Decision | Rationale |
|---|---|
| ✅ `proxy.ts` (NOT `middleware.ts`) | Next.js 16 native proxy pattern — don't create both |
| ✅ `gemini-3.1-flash-lite` as primary | High free quota, confirmed working |
| ✅ Groq as AI fallback | 14,400 req/day free, no credit card |
| ✅ Stripe + Supabase service role | Webhooks use `createServiceClient()`, bypass RLS |
| ✅ Zod validation on all API inputs | 400 on bad input, never crash |
| ✅ Plan enforcement at pipeline entry | `403` before expensive AI calls |
| ✅ Brand persistence is best-effort | 2s timeout, never blocks response |

### Known Gaps (Not Yet Addressed)

| Gap | Severity | When |
|---|---|---|
| No error monitoring (Sentry) | Medium | Phase 1 |
| No rate limiting | Medium | Phase 1 |
| Stripe webhook reconciliation | Low | Phase 4 |
| No brand limit dashboard UI | Low | Phase 3 |
| `console.log` in production routes | Low | Phase 1 |
| No Supabase migration directory | Low | Phase 0 |
