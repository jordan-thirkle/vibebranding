---
title: "Full Production Ship: Stripe, Groq Fallback, Security Hardening & Auth"
date: "2026-06-09"
description: "Complete production readiness push — Stripe payment flow with tiered pricing, Groq AI fallback for resilience, security headers, Zod validation, brand persistence, BCE fix, dashboard UX, and auth hardening."
tags: ["stripe", "payments", "security", "infrastructure", "ux", "ai-fallback", "auth"]
status: "ship"
---

# Full Production Ship

This session completed the production readiness push across every layer of VibeBranding.

## Stripe Payment Flow (New)
- **`/api/stripe/create-checkout`** — Creates Stripe Checkout Sessions for Pro ($19/mo) and Unlimited ($49/mo) plans
- **`/api/stripe/webhook`** — Handles subscription lifecycle events (checkout.completed, subscription.updated/deleted, invoice.payment_succeeded)
- **`/api/stripe/portal`** — Stripe Customer Portal for managing billing
- **`/api/stripe/plan`** — Returns current user's plan tier and brand count
- **`/pricing`** — Full pricing page with plan cards, current plan detection, and checkout flow
- **`src/lib/stripe/`** — Admin SDK, PlanConfig types, plan-check utility for usage enforcement
- **Nav updated** — Pricing link added

## AI Resilience
- **Groq fallback** (`src/ai/groq.ts`) — Llama 3.3 70B via Groq free tier (14,400 req/day, no CC)
- **Fallback router** (`src/ai/fallback.ts`) — Gemini first, auto-fallback to Groq on quota/rate-limit/network errors
- **6 module imports updated** — discovery, strategy, naming, typography, verbal, logo → now use `generateText()`

## Security Hardening
- **CSP + 7 security headers** in `next.config.ts` (HSTS, X-Frame-Options, Permissions-Policy, etc.)
- **Zod input validation** on `POST /api/brand` — returns 400 with field-level errors
- **Complete API route security audit** — all routes documented

## Brand Persistence
- **saveBrand / loadBrand / updateBrand** — Supabase CRUD with auth guard
- Pipeline auto-saves to `brands` table on completion (best-effort, 2s timeout)

## BCE Fix
- **Typography legibility warning eliminated** — `generateTypeScale()` ensures min label size >= 11px

## Auth Hardening
- **Auth callback enhanced** — profile auto-creation on first login, URL error messages, better error handling
- **Login page** — reads error params from callback, friendly error messages for `auth_failed`, `no_code`, `expired_token`, etc.

## Dashboard UX
- **BrandSkeleton** — 6 skeleton cards during load
- **ErrorBoundary** — wraps landing page and dashboard
- Delete confirmation (2-click flow) already existed

## New Files Created
```
src/ai/groq.ts                    # Groq API client
src/ai/fallback.ts                # Gemini → Groq fallback router
src/lib/stripe/admin.ts           # Stripe server SDK + plan configs
src/lib/stripe/plan-check.ts      # Usage limit enforcement
src/app/pricing/page.tsx          # Pricing page with plan cards
src/app/api/stripe/create-checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/app/api/stripe/portal/route.ts
src/app/api/stripe/plan/route.ts
src/components/BrandSkeleton.tsx   # Loading skeleton component
src/components/ErrorBoundary.tsx   # Error boundary component
src/app/api/brand/input-schema.ts  # Zod validation schema
src/lib/brand-persistence.ts       # Supabase brand CRUD
```

## By the Numbers
- **23 routes** in production build
- **221 tests passing** across 8 test files
- **0 TypeScript errors**
- **2 AI providers** (Gemini primary, Groq fallback)
- **3 plan tiers** (Free: 3 brands/mo, Pro: $19/mo, Unlimited: $49/mo)
- **7 security headers** applied globally

## Required Env Vars (New)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRO_PRICE_ID` — Stripe price ID for Pro plan
- `STRIPE_UNLIMITED_PRICE_ID` — Stripe price ID for Unlimited plan
- `GROQ_API_KEY` — Groq API key (optional fallback)
