/**
 * Plan check utilities — used by API routes to enforce usage limits.
 */
import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanTier } from "./admin";

export interface UserPlanInfo {
  tier: PlanTier;
  maxBrands: number;
  brandCount: number;
  canCreate: boolean;
  isUnlimited: boolean;
}

/**
 * Get the current user's plan info, including their brand count.
 * Returns a default "free" tier if not found or not authenticated.
 */
export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
  const supabase = await createClient();
  if (!supabase) {
    return { tier: "free", maxBrands: PLANS.free.maxBrands, brandCount: 0, canCreate: true, isUnlimited: false };
  }

  // Get plan tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_tier")
    .eq("id", userId)
    .single();

  const tier: PlanTier = (profile?.plan_tier as PlanTier) || "free";
  const plan = PLANS[tier];

  // Count existing brands
  const { count } = await supabase
    .from("brands")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const brandCount = count ?? 0;
  const isUnlimited = plan.maxBrands === -1;
  const canCreate = isUnlimited || brandCount < plan.maxBrands;

  return {
    tier,
    maxBrands: plan.maxBrands,
    brandCount,
    canCreate,
    isUnlimited,
  };
}
