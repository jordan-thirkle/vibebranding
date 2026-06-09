import { z } from "zod";

/**
 * Zod schema for POST /api/brand request body.
 * Mirrors what the frontend ProductForm sends.
 */
export const BrandPipelineInputSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(200, "Product name too long"),
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  category: z.string().max(200, "Category too long").optional().default("SaaS"),
  audienceDemographics: z.string().max(1000).optional(),
  audiencePsychographics: z.string().max(1000).optional(),
  competitors: z
    .union([
      z.array(z.string().max(200)).max(20, "Maximum 20 competitors"),
      z.string(),
    ])
    .optional()
    .default([]),
  keywords: z.array(z.string().max(100)).max(20).optional(),
  inspirations: z.array(z.string().max(200)).max(20).optional(),
});

export type BrandPipelineInput = z.infer<typeof BrandPipelineInputSchema>;

/**
 * Validate request body against the schema.
 * Returns { success, data, error } — compatible with SafeParseReturnType.
 */
export function validateBrandInput(body: unknown) {
  return BrandPipelineInputSchema.safeParse(body);
}
