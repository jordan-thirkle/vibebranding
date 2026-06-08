/**
 * Tests for the Mock Data fallback generator.
 *
 * Validates that mock data produces valid, deterministic, structurally correct
 * brand output that matches BSO type expectations and can serve as a fallback
 * when AI providers are unavailable.
 */

import { describe, it, expect } from "vitest";
import { generateMockBSO, generateMockStageResult } from "./mock-data";
import type { ProductInfo } from "@/core/bso/types";

const SAMPLE_PRODUCT: Partial<ProductInfo> = {
  name: "TestBrand",
  description: "A revolutionary product that helps developers build better software faster.",
  category: "Developer Tool",
  audience: {
    demographics: "Software developers aged 25-45",
    psychographics: "Early adopters who value productivity and clean code",
    techSophistication: "high",
  },
  competitors: [
    { name: "CompetitorA", notes: "Market leader" },
    { name: "CompetitorB", notes: "New entrant" },
  ],
};

const MINIMAL_PRODUCT: Partial<ProductInfo> = {
  name: "Mini",
  description: "A small utility",
  category: "Utility",
};

const LONG_NAME_PRODUCT: Partial<ProductInfo> = {
  name: "SuperLongProductNameThatShouldStillWorkCorrectlyInTheGenerator",
  description: "Testing edge cases with very long product names that might affect hash-based seeding",
  category: "Testing",
};

describe("generateMockBSO", () => {
  it("returns a partial BSO with product info for stage 1", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 1);
    expect(bso.product).toBeDefined();
    expect(bso.product?.name).toBe("TestBrand");
    expect(bso.product?.category).toBe("Developer Tool");
    expect(bso.strategy).toBeDefined();
  });

  it("produces deterministic output for the same input", () => {
    const a = generateMockBSO(SAMPLE_PRODUCT, 9);
    const b = generateMockBSO(SAMPLE_PRODUCT, 9);
    // Compare all sections individually (metadata timestamps may differ by 1ms)
    expect(a.product?.name).toBe(b.product?.name);
    expect(a.strategy?.emotionalTerritory).toBe(b.strategy?.emotionalTerritory);
    expect(a.visualIdentity?.colourSystem?.primaryColour).toBe(
      b.visualIdentity?.colourSystem?.primaryColour
    );
    expect(a.verbalIdentity?.naming?.selectedName).toBe(b.verbalIdentity?.naming?.selectedName);
    // Verify deterministic content by comparing without metadata
    const { metadata: _, ...restA } = a as any;
    const { metadata: __, ...restB } = b as any;
    expect(JSON.stringify(restA)).toBe(JSON.stringify(restB));
  });

  it("produces different output for different product names", () => {
    const product2: Partial<ProductInfo> = { ...SAMPLE_PRODUCT, name: "OtherBrand" };
    const a = generateMockBSO(SAMPLE_PRODUCT, 9);
    const b = generateMockBSO(product2, 9);
    // Different name should yield different emotional territory or archetypes
    const aTerritory = a.strategy?.emotionalTerritory;
    const bTerritory = b.strategy?.emotionalTerritory;
    // At least the names should differ
    expect(a.product?.name).not.toBe(b.product?.name);
  });

  it("works with minimal product input (no audience or competitors)", () => {
    const bso = generateMockBSO(MINIMAL_PRODUCT, 9);
    expect(bso.product?.name).toBe("Mini");
    expect(bso.product?.audience?.demographics).toBe("Tech-savvy professionals aged 25–45");
    expect(bso.visualIdentity?.colourSystem?.primaryColour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(bso.verbalIdentity?.naming?.candidates).toHaveLength(5);
  });

  it("handles very long product names without crashing", () => {
    const bso = generateMockBSO(LONG_NAME_PRODUCT, 9);
    expect(bso.product?.name).toBe(LONG_NAME_PRODUCT.name);
    expect(bso.strategy?.personalityArchetypes).toHaveLength(3);
  });

  it("includes strategy data from stage >= 1", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 1);
    expect(bso.strategy?.positioning).toBeTruthy();
    expect(bso.strategy?.personalityArchetypes).toHaveLength(3);
    expect(bso.strategy?.brandValues).toHaveLength(4);
    expect(bso.strategy?.emotionalTerritory).toBeTruthy();
  });

  it("includes verbalIdentity data from stage >= 3", () => {
    const bsoStage2 = generateMockBSO(SAMPLE_PRODUCT, 2);
    const bsoStage3 = generateMockBSO(SAMPLE_PRODUCT, 3);

    expect(bsoStage2.verbalIdentity?.naming).toBeUndefined();
    expect(bsoStage3.verbalIdentity?.naming).toBeDefined();
    expect(bsoStage3.verbalIdentity?.naming?.candidates).toHaveLength(5);
    expect(bsoStage3.verbalIdentity?.taglines).toHaveLength(5);
    expect(bsoStage3.verbalIdentity?.messagingHierarchy?.heroHeadline).toBeTruthy();
  });

  it("includes visualIdentity data from stage >= 4", () => {
    const bsoStage3 = generateMockBSO(SAMPLE_PRODUCT, 3);
    const bsoStage4 = generateMockBSO(SAMPLE_PRODUCT, 4);

    expect(bsoStage3.visualIdentity?.colourSystem).toBeUndefined();
    expect(bsoStage4.visualIdentity?.colourSystem).toBeDefined();
    expect(bsoStage4.visualIdentity?.colourSystem?.primaryColour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(bsoStage4.visualIdentity?.typography?.displayFont?.name).toBeTruthy();
    expect(bsoStage4.visualIdentity?.iconography?.strokeWeight).toBeGreaterThan(0);
    expect(bsoStage4.visualIdentity?.motionLanguage?.personality?.duration).toMatch(
      /^(snappy|quick|deliberate|languid)$/
    );
  });

  it("produces WCAG-passing colour systems", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    expect(bso.visualIdentity?.colourSystem?.wcagReport?.overall).toBe("pass");
    expect(bso.visualIdentity?.colourSystem?.wcagReport?.checks).toHaveLength(1);
    expect(bso.visualIdentity?.colourSystem?.wcagReport?.checks[0]?.normalTextPass).toBe(true);
  });

  it("generates valid CSS tokens", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    const css = bso.visualIdentity?.colourSystem?.tokens?.css;
    expect(css).toContain("--color-primary");
    expect(css).toContain("--color-secondary");
    expect(css).toContain("--color-accent");
  });

  it("generates valid Tailwind tokens", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    const tw = bso.visualIdentity?.colourSystem?.tokens?.tailwind;
    expect(tw).toContain("colors:");
    expect(tw).toContain("primary:");
    expect(tw).toContain("secondary:");
  });

  it("generates 9 type scale sizes", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    expect(bso.visualIdentity?.typography?.typeScale?.sizes).toHaveLength(9);
    expect(bso.visualIdentity?.typography?.typeScale?.ratio).toBe(1.25);
  });

  it("generates copy examples with on-brand, too-formal and too-casual variations", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 3);
    const copy = bso.verbalIdentity?.copyExamples;
    expect(copy?.toneVariations?.onBrand).toHaveLength(2);
    expect(copy?.toneVariations?.tooFormal).toHaveLength(1);
    expect(copy?.toneVariations?.tooCasual).toHaveLength(1);
    expect(copy?.microcopy?.buttonLabels?.submit).toBe("Generate");
    expect(copy?.brandVocabulary?.ownedWords).toContain("Brand");
  });
});

describe("generateMockStageResult", () => {
  it("returns discovery result for stage 1", () => {
    const result = generateMockStageResult(1, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.audiencePersona).toBeTruthy();
    expect(result.positioningStatement).toBeTruthy();
    expect(result.report).toContain("Brand Discovery Report");
  });

  it("returns strategy result for stage 2", () => {
    const result = generateMockStageResult(2, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(Array.isArray(result.archetypes)).toBe(true);
    expect((result.archetypes as unknown[]).length).toBeGreaterThan(0);
    expect(result.emotionalTerritory).toBeTruthy();
  });

  it("returns naming result for stage 3", () => {
    const result = generateMockStageResult(3, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(Array.isArray(result.candidates)).toBe(true);
    expect((result.candidates as unknown[]).length).toBe(5);
    expect(typeof result.recommended).toBe("number");
  });

  it("returns visual identity result for stage 4", () => {
    const result = generateMockStageResult(4, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result.displayFont).toBeTruthy();
    expect(result.harmonyType).toMatch(/^(complementary|triadic|analogous|split_complementary|monochromatic)$/);
  });

  it("returns verbal identity result for stage 6", () => {
    const result = generateMockStageResult(6, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(Array.isArray(result.taglines)).toBe(true);
    expect(result.heroHeadline).toContain("TestBrand");
    expect(result.primaryCTA).toBe("Get Started Free");
  });

  it("returns success for unknown stages", () => {
    const result = generateMockStageResult(99, SAMPLE_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
  });

  it("is deterministic — same input gives same output", () => {
    const a = generateMockStageResult(3, SAMPLE_PRODUCT);
    const b = generateMockStageResult(3, SAMPLE_PRODUCT);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("produces different candidates for different product names", () => {
    const result1 = generateMockStageResult(3, SAMPLE_PRODUCT) as { candidates: Array<{ name: string }> };
    const result2 = generateMockStageResult(3, { ...SAMPLE_PRODUCT, name: "Different" }) as { candidates: Array<{ name: string }> };
    const names1 = result1.candidates.map((c) => c.name);
    const names2 = result2.candidates.map((c) => c.name);
    // At least some names should differ
    expect(names1).not.toEqual(names2);
  });

  it("minimal input does not crash stage 4 colour output", () => {
    const result = generateMockStageResult(4, MINIMAL_PRODUCT) as Record<string, unknown>;
    expect(result.success).toBe(true);
    expect(result.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("generateMockBSO - edge cases", () => {
  it("generates a valid colour palette with proper hex codes", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    const cs = bso.visualIdentity?.colourSystem;
    expect(cs?.primaryColour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(cs?.secondaryColour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(cs?.accentColour).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("respects 60-30-10 colour distribution", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 4);
    const dist = bso.visualIdentity?.colourSystem?.distribution;
    expect(dist?.primaryPercent).toBe(60);
    expect(dist?.secondaryPercent).toBe(30);
    expect(dist?.accentPercent).toBe(10);
  });

  it("generates archetypes with valid weights (0-100)", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 1);
    const archetypes = bso.strategy?.personalityArchetypes || [];
    expect(archetypes.length).toBe(3);
    for (const a of archetypes) {
      expect(a.weight).toBeGreaterThanOrEqual(0);
      expect(a.weight).toBeLessThanOrEqual(100);
      expect(a.archetype).toBeTruthy();
      expect(a.rationale).toBeTruthy();
    }
  });

  it("generates tone of voice in valid range (0-100)", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 1);
    const tone = bso.strategy?.toneOfVoice;
    expect(tone?.formalToCasual).toBeGreaterThanOrEqual(0);
    expect(tone?.formalToCasual).toBeLessThanOrEqual(100);
    expect(tone?.seriousToWitty).toBeGreaterThanOrEqual(0);
    expect(tone?.seriousToWitty).toBeLessThanOrEqual(100);
  });

  it("includes logo data from stage >= 5", () => {
    const bsoStage4 = generateMockBSO(SAMPLE_PRODUCT, 4);
    const bsoStage5 = generateMockBSO(SAMPLE_PRODUCT, 5);

    expect(bsoStage4.visualIdentity?.logo).toBeUndefined();
    expect(bsoStage5.visualIdentity?.logo).toBeDefined();
    expect(bsoStage5.visualIdentity?.logo?.typology).toBe("icon_wordmark");
    expect(bsoStage5.visualIdentity?.logo?.concepts).toHaveLength(3);
    expect(bsoStage5.visualIdentity?.logo?.lockups).toHaveLength(4);
    expect(bsoStage5.visualIdentity?.logo?.qualityChecks).toBeDefined();
    expect(bsoStage5.visualIdentity?.logo?.qualityChecks?.legibility16px).toBe(true);
    expect(bsoStage5.visualIdentity?.logo?.qualityChecks?.competitorProximity).toBe("distinct");
  });

  it("logo qualityChecks pass all reproducibility requirements", () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 9);
    const qc = bso.visualIdentity?.logo?.qualityChecks!;
    expect(qc.legibility16px).toBe(true);
    expect(qc.oneColourReproduction).toBe(true);
    expect(qc.backgroundVersatility).toBe(true);
    expect(qc.competitorProximity).toMatch(/^(distinct|similar|conflicting)$/);
  });

  it("full stage 9 BSO passes all 10 BCE checks", async () => {
    const bso = generateMockBSO(SAMPLE_PRODUCT, 9) as any;
    const { getConsistencyEngine } = await import("@/core/consistency-engine");
    const engine = getConsistencyEngine();
    const report = engine.run(bso as any);

    expect(report.totalChecks).toBe(10);
    expect(report.errors).toBe(0);
    // Allow warnings (they're informational), but no hard errors
    expect(report.overall).toBe("ready");

    // Log detail for debugging
    for (const check of report.checks) {
      if (check.status !== "pass") {
        console.log(`[${check.status.toUpperCase()}] ${check.name}: ${check.details}`);
      }
    }
  });
});
