/**
 * GET /api/health — health check endpoint
 *
 * Returns service status for monitoring (Vercel, Docker, uptime checks).
 * Does NOT require authentication.
 *
 * Response: 200 OK if the server is running and configured.
 * Useful for Docker healthcheck, Vercel cron, and load balancers.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // never cache

export async function GET() {
  const envChecks = {
    supabase: {
      configured: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")
      ),
      serviceRoleConfigured: !!(
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes("placeholder")
      ),
    },
    ai: {
      geminiConfigured: !!(
        process.env.GEMINI_API_KEY &&
        !process.env.GEMINI_API_KEY?.includes("placeholder")
      ),
      groqConfigured: !!(
        process.env.GROQ_API_KEY &&
        !process.env.GROQ_API_KEY?.includes("placeholder")
      ),
    },
    stripe: {
      configured: !!(
        process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_WEBHOOK_SECRET &&
        process.env.STRIPE_PRO_PRICE_ID &&
        process.env.STRIPE_UNLIMITED_PRICE_ID &&
        !process.env.STRIPE_SECRET_KEY?.includes("placeholder")
      ),
    },
  };

  const allCritical = envChecks.supabase.configured && envChecks.ai.geminiConfigured;
  const allConfigured = allCritical && envChecks.stripe.configured;

  return NextResponse.json(
    {
      status: allCritical ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      checks: envChecks,
    },
    {
      status: allCritical ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    }
  );
}
