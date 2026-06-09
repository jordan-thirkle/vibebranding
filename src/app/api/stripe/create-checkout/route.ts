/**
 * POST /api/stripe/create-checkout
 * Body: { plan: "pro" | "unlimited" }
 *
 * Creates a Stripe Checkout Session for the given plan.
 * Requires authenticated user.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PLANS, type PlanTier } from "@/lib/stripe/admin";

const ALLOWED_PLANS: PlanTier[] = ["pro", "unlimited"];

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate plan
    const body = (await request.json()) as { plan?: string };
    const plan = body.plan as PlanTier;
    if (!plan || !ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Allowed: ${ALLOWED_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig.priceId) {
      return NextResponse.json({ error: "Plan has no price configured" }, { status: 500 });
    }

    // Create or retrieve Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: `${request.nextUrl.origin}/pricing?checkout=cancelled`,
      metadata: { supabase_user_id: user.id, plan },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
