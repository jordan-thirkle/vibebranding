/**
 * Brand Persistence — saves/loads brand data from Supabase.
 * Used after the pipeline completes to persist generated brands.
 */

import { createClient } from "@/lib/supabase/server";
import type { BrandStateObject } from "@/core/bso/types";

export interface SavedBrand {
  id: string;
  name: string;
  description: string | null;
  stage: number;
  user_id: string;
  bso: BrandStateObject;
  created_at: string;
  updated_at: string;
}

/**
 * Save a completed brand to Supabase.
 * Returns the saved brand record or null if not authenticated / unconfigured.
 */
export async function saveBrand(
  productName: string,
  description: string,
  stage: number,
  bso: BrandStateObject
): Promise<SavedBrand | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("brands")
    .insert({
      name: productName,
      description: description.slice(0, 500),
      stage,
      user_id: user.id,
      bso: JSON.parse(JSON.stringify(bso)), // strip undefined fields
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save brand:", error.message);
    return null;
  }

  return data as unknown as SavedBrand;
}

/**
 * Update an existing brand's BSO and stage.
 */
export async function updateBrand(
  brandId: string,
  stage: number,
  bso: BrandStateObject
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;

  const { error } = await supabase
    .from("brands")
    .update({
      stage,
      bso: JSON.parse(JSON.stringify(bso)),
    })
    .eq("id", brandId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update brand:", error.message);
    return false;
  }

  return true;
}

/**
 * Load a brand's BSO by ID (owner-only).
 */
export async function loadBrand(brandId: string): Promise<SavedBrand | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return data as unknown as SavedBrand;
}
