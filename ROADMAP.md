# VibeBranding — Production Roadmap

> Generated 2026-06-09 · Updated 2026-06-09 (Phase 1 delivered)
> Status: **256 tests ✅ (13 files), 25 routes, build ✅, shipped to production**

---

## Phase 0 — Ship It ✅ (Done)

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | **Set `SUPABASE_SERVICE_ROLE_KEY`** in Vercel env vars | ✅ Already set | Was already in prod env vars |
| 0.2 | **Run migration** on Supabase (`profiles` table) | ⏳ Need SQL run | Migration files in `supabase/migrations/` |
| 0.3 | **Deploy to Vercel** — verify everything boots | ✅ Deployed | `12904bc` → `5cdc097` on master |
| 0.4 | **Test checkout flow** end-to-end | 🔒 Needs Stripe keys | `STRIPE_*` env vars not set yet |
| 0.5 | **Test auth callback** | ⏳ Pending | Need to verify on live site |
| 0.6 | **Run first real AI pipeline** in prod | ✅ Working | Gemini 3.1-flash-lite confirmed |

---

## Phase 1 — Observability (Delivery 1 ✅)

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | **Add Sentry** (`@sentry/nextjs`) | ❌ Not done | Still needs `npm install @sentry/nextjs` |
| 1.2 | **Replace `console.log`** with structured logger | ❌ Not done | Phase 2 candidate |
| 1.3 | **Add rate limiting** | ✅ Built | `src/lib/rate-limit.ts` — sliding window |
| 1.4 | **Gemini quota dashboard** | ❌ Not done | Future |
| 1.5 | **Health check endpoint** (`GET /api/health`) | ✅ Built + deployed | `src/app/api/health/route.ts` — 25 routes |
| 1.6 | **Stripe subscription sync cron** | ✅ Built | `GET /api/cron/sync-subscriptions` — daily |
| 1.7 | **Numbered SQL migrations** | ✅ Built | `supabase/migrations/001-003` with tracking table |

---

## Phase 2 — Test Coverage (Delivery 2 ✅)

| # | Task | Before | After | Files |
|---|---|---|---|---|
| 2.1 | **Stripe admin** | **0%** | ✅ **6 tests** | `admin.test.ts` — PLANS, getPlanByPriceId |
| 2.2 | **AI Gemini** | **0%** | ✅ **3 tests** | `gemini.test.ts` — generateWithGemini (mock fetch) |
| 2.3 | **Input schema** | **0%** | ✅ **9 tests** | `input-schema.test.ts` — Zod validation |
| 2.4 | **Env validation** | **0%** | ✅ **11 tests** | `env.test.ts` — validate, stripe, groq, service |
| 2.5 | **Rate limiter** | **0%** | ✅ **6 tests** | `rate-limit.test.ts` — window, block, reset, cleanup |
| 2.6 | **Stripe routes** (webhook, checkout, plan, portal) | **0%** | ❌ **0%** | Need Supabase mock |
| 2.7 | **AI fallback** (groq.ts, fallback.ts) | **0%** | ❌ **0%** | Needs external API mock |
| 2.8 | **Brand persistence** | **0%** | ❌ **0%** | Needs Supabase mock |
| 2.9 | **Pipeline integration** | **0%** | ❌ **0%** | Needs full mock |

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
| 4.1 | **Stripe reconciliation cron** (`/api/cron/sync-subscriptions`) | ✅ Done | Already built + deployed with vercel.json cron config |
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
| ✅ `proxy.ts` (NOT `middleware.ts`) | Next.js 16 native proxy pattern — confirmed working |
| ✅ `resetEnvValidation()` in env.ts | Enables test isolation for env-dependent modules |
| ✅ `gemini-3.1-flash-lite` as primary | High free quota, confirmed working |
| ✅ Groq as AI fallback | 14,400 req/day free, no credit card |
| ✅ Stripe + Supabase service role | Webhooks use `createServiceClient()`, bypass RLS |
| ✅ Zod validation on all API inputs | 400 on bad input, never crash |
| ✅ Plan enforcement at pipeline entry | `403` before expensive AI calls |
| ✅ Brand persistence is best-effort | 2s timeout, never blocks response |

### Known Gaps (Not Yet Addressed)

| Gap | Severity | When |
|---|---|---|
| No error monitoring (Sentry) | Medium | Phase 2 |
| No structured logging | Low | Phase 2 |
| No brand limit dashboard UI | Low | Phase 3 |
| `console.log` in production routes | Low | Phase 2 |
| Stripe routes untested (need mocks) | Medium | Phase 2 |
| AI fallback module untested | Medium | Phase 2 |
