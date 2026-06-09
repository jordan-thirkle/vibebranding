/**
 * Stripe Admin SDK — server-side only (never import in client components).
 */
import Stripe from "stripe";

// Lazy-init singleton so it doesn't crash at build time
let _stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "placeholder" || key.startsWith("sk_test_placeholder")) {
    return null;
  }
  // Let Stripe SDK use its own default API version (currently 2025-11-01)
  _stripe = new Stripe(key);
  return _stripe;
}

export { getStripe };

export interface PlanConfig {
  name: string;
  priceId: string | null;
  maxBrands: number; // -1 = unlimited
  features: string[];
}

/** Product/price IDs from your Stripe dashboard */
export const PLANS: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    priceId: null,
    maxBrands: 3,
    features: ["3 brands/month", "Basic export (CSS/Tailwind)", "AI-powered generation"],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    maxBrands: 50,
    features: [
      "50 brands/month",
      "All export formats (CSS, Tailwind, SCSS, Figma, HTML)",
      "Priority AI processing",
      "Brand kit download (ZIP)",
      "Priority support",
    ],
  },
  unlimited: {
    name: "Unlimited",
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID || null,
    maxBrands: -1, // unlimited
    features: [
      "Unlimited brands",
      "All export formats",
      "Priority AI processing",
      "Brand kit download (ZIP/PDF)",
      "API access",
      "Dedicated support",
    ],
  },
};

export type PlanTier = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return tier as PlanTier;
  }
  return null;
}
