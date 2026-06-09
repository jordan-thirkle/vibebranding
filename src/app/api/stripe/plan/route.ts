/**
 * GET /api/stripe/plan
 *
 * Returns the current user's plan info.
 * Used by the pricing page and dashboard to show usage limits.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plan-check";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ tier: "free", maxBrands: 3, brandCount: 0, canCreate: true });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ tier: "free", maxBrands: 3, brandCount: 0, canCreate: true });
  }

  const plan = await getUserPlan(user.id);
  return NextResponse.json(plan);
}
