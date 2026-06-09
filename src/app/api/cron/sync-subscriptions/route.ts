/**
 * Cron: Stripe Subscription Sync
 *
 * Runs daily to reconcile Stripe subscriptions with Supabase profiles.
 * Catches any webhooks that were missed due to downtime.
 *
 * Protected by CRON_SECRET env var (Vercel Cron Jobs).
 * GET /api/cron/sync-subscriptions
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe, getPlanByPriceId } from "@/lib/stripe/admin";

export const maxDuration = 120; // can take up to 2 minutes for many users
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Auth check: verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  const supabase = createServiceClient();
  if (!stripe || !supabase) {
    return NextResponse.json({ error: "Stripe or Supabase not configured" }, { status: 503 });
  }

  try {
    // Get all profiles with stripe_customer_id
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id, plan_tier")
      .not("stripe_customer_id", "is", null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ synced: 0, message: "No stripe customers found" });
    }

    let synced = 0;
    let errors = 0;

    for (const profile of profiles) {
      try {
        // Fetch subscriptions from Stripe
        const subs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id!,
          limit: 1,
          status: "all",
        });

        const activeSub = subs.data.find(
          (s) => s.status === "active" || s.status === "trialing" || s.status === "past_due"
        );

        if (activeSub) {
          const priceId = activeSub.items.data[0]?.price.id;
          const plan = priceId ? getPlanByPriceId(priceId) : null;

          if (plan && profile.plan_tier !== plan) {
            await supabase.from("profiles").upsert({
              id: profile.id,
              plan_tier: plan,
              updated_at: new Date().toISOString(),
            });
            synced++;
          }
        } else if (profile.plan_tier !== "free") {
          // No active subscription — downgrade to free
          await supabase.from("profiles").upsert({
            id: profile.id,
            plan_tier: "free",
            updated_at: new Date().toISOString(),
          });
          synced++;
        }
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      synced,
      errors,
      checked: profiles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Subscription sync failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
