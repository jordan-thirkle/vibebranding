import { z } from "zod";

// ─── Product ────────────────────────────────────────────────

export const AudienceProfileSchema = z.object({
  demographics: z.string().min(1, "Demographics are required"),
  psychographics: z.string().min(1, "Psychographics are required"),
  techSophistication: z.enum(["low", "medium", "high"]),
  ageRange: z.string().optional(),
  goals: z.array(z.string()).optional(),
  fears: z.array(z.string()).optional(),
  aesthetics: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
});

export const CompetitorSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  notes: z.string(),
});

export const ProductInfoSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  audience: AudienceProfileSchema,
  competitors: z.array(CompetitorSchema).default([]),
});

// ─── Strategy ───────────────────────────────────────────────

const brandArchetypes = [
  "Hero",
  "Creator",
  "Explorer",
  "Sage",
  "Outlaw",
  "Magician",
  "Everyman",
  "Lover",
  "Jester",
  "Caregiver",
  "Ruler",
  "Innocent",
] as const;

export const BrandArchetypeSchema = z.object({
  archetype: z.enum(brandArchetypes),
  weight: z.number().min(0).max(100),
  rationale: z.string().min(10),
});

export const PersonalitySpectrumSchema = z.object({
  excitingVsCalm: z.number().min(0).max(100).default(50),
  modernVsClassic: z.number().min(0).max(100).default(50),
  playfulVsSerious: z.number().min(0).max(100).default(50),
  accessibleVsExclusive: z.number().min(0).max(100).default(50),
  boldVsUnderstated: z.number().min(0).max(100).default(50),
});

export const ToneOfVoiceSchema = z.object({
  formalToCasual: z.number().min(0).max(100).default(50),
  seriousToWitty: z.number().min(0).max(100).default(50),
  authoritativeToApproachable: z.number().min(0).max(100).default(50),
  conventionalToIrreverent: z.number().min(0).max(100).default(50),
  examples: z
    .array(
      z.object({
        inVoice: z.string(),
        outOfVoice: z.string(),
      })
    )
    .optional(),
});

export const StrategyInfoSchema = z.object({
  positioning: z.string().min(10, "Positioning statement is required"),
  personalityArchetypes: z.array(BrandArchetypeSchema).min(1),
  personalitySpectrum: PersonalitySpectrumSchema,
  brandValues: z.array(z.string()).min(3).max(5),
  toneOfVoice: ToneOfVoiceSchema,
  emotionalTerritory: z.string().min(3),
});

// ─── Visual Identity ────────────────────────────────────────

export const ColourTokenSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  hsl: z.string(),
  role: z.string(),
  lightMode: z.string(),
  darkMode: z.string(),
});

export const WcagCheckSchema = z.object({
  foreground: z.string(),
  background: z.string(),
  contrastRatio: z.number(),
  normalTextPass: z.boolean(),
  largeTextPass: z.boolean(),
});

export const WcagReportSchema = z.object({
  overall: z.enum(["pass", "fail"]),
  checks: z.array(WcagCheckSchema),
});

export const ColourSystemInfoSchema = z.object({
  harmonyType: z.enum([
    "complementary",
    "split_complementary",
    "triadic",
    "analogous",
    "monochromatic",
  ]),
  primaryColour: z.string(),
  secondaryColour: z.string(),
  accentColour: z.string(),
  neutralScale: z.array(ColourTokenSchema),
  semanticColours: z.array(ColourTokenSchema),
  surfaceColours: z.array(ColourTokenSchema),
  textColours: z.array(ColourTokenSchema),
  distribution: z.object({
    primaryPercent: z.number(),
    secondaryPercent: z.number(),
    accentPercent: z.number(),
  }),
  wcagReport: WcagReportSchema,
  tokens: z.object({
    css: z.string(),
    tailwind: z.string(),
    scss: z.string(),
  }),
});

export const FontSelectionSchema = z.object({
  name: z.string(),
  classification: z.string(),
  source: z.enum(["google", "adobe", "self_hosted", "system"]),
  weights: z.array(z.number()),
  isVariable: z.boolean(),
  fallbackStack: z.string(),
  rationale: z.string(),
  embedCode: z.string().optional(),
});

export const TypeScaleSizeSchema = z.object({
  name: z.string(),
  sizePx: z.number(),
  sizeRem: z.number(),
  lineHeight: z.number(),
  usage: z.string(),
});

export const TypeScaleSchema = z.object({
  ratio: z.number(),
  ratioName: z.enum(["major_third", "perfect_fourth", "augmented_fourth", "minor_third"]),
  sizes: z.array(TypeScaleSizeSchema),
});

export const TypographyInfoSchema = z.object({
  displayFont: FontSelectionSchema,
  textFont: FontSelectionSchema,
  monoFont: FontSelectionSchema.optional(),
  typeScale: TypeScaleSchema,
  pairingRationale: z.string(),
  tokens: z.object({
    css: z.string(),
    tailwind: z.string(),
  }),
});

// ─── Verbal Identity ────────────────────────────────────────

export const NameCandidateSchema = z.object({
  name: z.string().min(1).max(15),
  approach: z.enum(["descriptive", "evocative", "invented", "metaphorical", "compound"]),
  rationale: z.string(),
  scores: z.object({
    phonetics: z.number().min(1).max(10),
    memorability: z.number().min(1).max(10),
    distinctiveness: z.number().min(1).max(10),
    overall: z.number().min(1).max(10),
  }),
  availability: z.object({
    dotCom: z.boolean(),
    dotIo: z.boolean(),
    dotApp: z.boolean(),
    socialHandles: z.record(z.string(), z.boolean()),
  }),
  trademarkRisk: z.enum(["low", "medium", "high", "conflict"]),
  negativeMeanings: z.array(z.string()),
});

// ─── Consistency ─────────────────────────────────────────────

export const ConsistencyCheckSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "warn", "flag", "skip"]),
  details: z.string(),
  remediation: z.string().optional(),
  severity: z.enum(["info", "warning", "error"]),
});

export const ConsistencyReportSchema = z.object({
  checks: z.array(ConsistencyCheckSchema),
  totalChecks: z.number(),
  passed: z.number(),
  warnings: z.number(),
  errors: z.number(),
  overall: z.enum(["ready", "needs_fixes"]),
});

// ─── Root BSO ────────────────────────────────────────────────

export const BrandStateObjectSchema = z.object({
  version: z.string().default("1.0.0"),
  product: ProductInfoSchema,
  strategy: StrategyInfoSchema,
  visualIdentity: z.object({}).passthrough().optional(),
  verbalIdentity: z.object({}).passthrough().optional(),
  assets: z.object({
    generated: z.array(z.unknown()).default([]),
    exportFormats: z.array(z.string()).default([]),
  }),
  consistencyReport: ConsistencyReportSchema.optional(),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    stage: z.number().min(1).max(9).default(1),
    history: z
      .array(
        z.object({
          timestamp: z.string(),
          stage: z.number(),
          message: z.string(),
          snapshot: z.object({}).passthrough(),
        })
      )
      .default([]),
  }),
});

// ─── Derived Types ───────────────────────────────────────────

export type BrandStateObject = z.infer<typeof BrandStateObjectSchema>;
export type ProductInfo = z.infer<typeof ProductInfoSchema>;
export type StrategyInfo = z.infer<typeof StrategyInfoSchema>;
export type BrandArchetype = z.infer<typeof BrandArchetypeSchema>;
export type PersonalitySpectrum = z.infer<typeof PersonalitySpectrumSchema>;
export type ToneOfVoice = z.infer<typeof ToneOfVoiceSchema>;
export type ColourSystemInfo = z.infer<typeof ColourSystemInfoSchema>;
export type TypographyInfo = z.infer<typeof TypographyInfoSchema>;
export type TypeScale = z.infer<typeof TypeScaleSchema>;
export type FontSelection = z.infer<typeof FontSelectionSchema>;
export type ConsistencyCheck = z.infer<typeof ConsistencyCheckSchema>;
export type ConsistencyReport = z.infer<typeof ConsistencyReportSchema>;
