/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler — receives subscription lifecycle events.
 * Updates the user's plan tier in Supabase on:
 *  - checkout.session.completed
 *  - invoice.payment_succeeded
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe, getPlanByPriceId, type PlanTier } from "@/lib/stripe/admin";

export const maxDuration = 60; // webhooks can take time

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  // Verify webhook signature
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase service client not configured" }, { status: 503 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { metadata?: Record<string, string>; customer?: string };
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan as PlanTier;

        if (userId && plan) {
          await supabase.from("profiles").upsert({
            id: userId,
            plan_tier: plan,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          });
          console.log(`✅ User ${userId} subscribed to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          items?: { data?: Array<{ price?: { id: string } }> };
          customer?: string;
          status: string;
        };

        const priceId = subscription.items?.data?.[0]?.price?.id;
        const plan = priceId ? getPlanByPriceId(priceId) : null;

        if (subscription.customer && plan) {
          // Find user by stripe_customer_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", subscription.customer)
            .single();

          if (profile) {
            const newTier = subscription.status === "active" || subscription.status === "trialing"
              ? plan
              : "free" as PlanTier;

            await supabase.from("profiles").upsert({
              id: profile.id,
              plan_tier: newTier,
              updated_at: new Date().toISOString(),
            });
            console.log(`✅ User ${profile.id} plan updated to ${newTier}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as {
          subscription?: string;
          customer?: string;
        };
        // Confirm subscription is still active
        if (invoice.subscription && stripe) {
          try {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription);
            if (sub.status !== "active" && sub.status !== "trialing") break;

            const priceId = sub.items?.data?.[0]?.price?.id;
            const plan = priceId ? getPlanByPriceId(priceId) : null;

            if (invoice.customer && plan) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("stripe_customer_id", invoice.customer)
                .single();

              if (profile) {
                await supabase.from("profiles").upsert({
                  id: profile.id,
                  plan_tier: plan,
                  updated_at: new Date().toISOString(),
                });
              }
            }
          } catch {
            // subscription may have been deleted
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
