/**
 * VibeBranding API — Full Brand Generation Pipeline
 *
 * POST /api/brand
 * Body: { productName, description, category, ... }
 * Query:
 *   ?stage=N — stop after stage N (1-9)
 *   ?mock=true — use deterministic mock data (no AI calls needed)
 *
 * Runs stages 1-9 sequentially, returning results at each stage.
 * When mock=true or a stage fails (AI quota exhausted), falls back
 * to deterministic mock data so the demo always works end-to-end.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBsoStore, resetBsoStore } from "@/core/bso";
import { getPromptEngine, registerAllTemplates } from "@/core/prompt-engine/index";
import { runDiscovery } from "@/modules/discovery/index";
import { runStrategy } from "@/modules/strategy/index";
import { runNaming } from "@/modules/naming/index";
import { runColourSystem } from "@/modules/color/index";
import { runTypography } from "@/modules/typography/index";
import { runLogo } from "@/modules/logo/index";
import { runIconography } from "@/modules/iconography/index";
import { runMotion } from "@/modules/motion/index";
import { runVerbalIdentity } from "@/modules/verbal/index";
import { runApplications } from "@/modules/applications/index";
import { runGuidelines } from "@/modules/guidelines/index";
import { getConsistencyEngine } from "@/core/consistency-engine/index";
import { generateMockBSO, generateMockStageResult } from "@/ai/mock-data";
import { validateBrandInput } from "./input-schema";
import { saveBrand } from "@/lib/brand-persistence";
import type { Competitor, ProductInfo, BrandStateObject } from "@/core/bso/types";

// Allow up to 60s for sequential AI calls (Vercel Hobby supports up to 60s since May 2024)
export const maxDuration = 60;

// Register all prompt templates once at module load
registerAllTemplates(getPromptEngine());

/** Detect if an error is AI-quota-related and should trigger mock fallback */
function isQuotaError(errorText: string): boolean {
  const quotaSignals = [
    "429",
    "quota",
    "rate limit",
    "RESOURCE_EXHAUSTED",
    "insufficient_quota",
    "SAFETY",
    "blocked",
  ];
  return quotaSignals.some((s) => errorText.toLowerCase().includes(s.toLowerCase()));
}

/** Check if mock mode is requested (query param or forced) */
function isMockMode(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("mock") === "true";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateBrandInput(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errors.join("; ")}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetStage = parseInt(searchParams.get("stage") || "9", 10);
    const mockMode = isMockMode(request);
    const productInput: Partial<ProductInfo> = {
      name: body.productName || body.name || "Untitled",
      description: body.description || "",
      category: body.category || "SaaS",
      audience: {
        demographics: body.audienceDemographics,
        psychographics: body.audiencePsychographics,
        techSophistication: "medium",
      },
      competitors: (body.competitors || []).map((n: string) => ({ name: n, notes: "" })),
    };

    // Reset BSO for fresh generation
    resetBsoStore();

    // If mock mode, pre-populate the BSO with all mock data up to targetStage
    if (mockMode) {
      const mockBSO = generateMockBSO(productInput, targetStage);
      const store = getBsoStore();
      if (mockBSO.strategy) store.update("strategy", mockBSO.strategy);
      if (mockBSO.verbalIdentity) store.update("verbalIdentity", mockBSO.verbalIdentity);
      if (mockBSO.visualIdentity) store.update("visualIdentity", mockBSO.visualIdentity);
      while (store.get().metadata.stage < targetStage) {
        store.advanceStage();
      }
    }

    const results: Record<string, unknown> = {};
    let mockFallbackUsed = false;

    // ─── Stage 1: Discovery ────────────────────────────
    if (!mockMode) {
      const discoveryResult = await runDiscovery({
        productName: body.productName || body.name || "Untitled",
        description: body.description || "",
        category: body.category || "SaaS",
        audienceDemographics: body.audienceDemographics,
        audiencePsychographics: body.audiencePsychographics,
        competitorNames: body.competitors,
        brandInspirations: body.inspirations,
        personalityKeywords: body.keywords,
      });

      if (discoveryResult.success) {
        results.discovery = {
          positioning: discoveryResult.positioningStatement,
          audiencePersona: discoveryResult.audiencePersona?.slice(0, 200),
        };
      } else {
        mockFallbackUsed = true;
        const mockStage = generateMockStageResult(1, productInput);
        results.discovery = {
          positioning: mockStage.positioningStatement,
          audiencePersona: String(mockStage.audiencePersona).slice(0, 200),
          _mock: true,
        };
      }
    } else {
      const mockStage = generateMockStageResult(1, productInput);
      results.discovery = {
        positioning: mockStage.positioningStatement,
        audiencePersona: String(mockStage.audiencePersona).slice(0, 200),
        _mock: true,
      };
    }

    if (targetStage <= 1) {
      return NextResponse.json({ success: true, stage: 1, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── Stage 2: Strategy ──────────────────────────────
    if (!mockMode) {
      const strategyPromise = (async () => {
        try { return await runStrategy(); }
        catch { return { success: false as const, archetypes: [], emotionalTerritory: "", values: [], toneSummary: "", errors: ["Strategy failed"] }; }
      })();

      if (targetStage >= 3) {
        // Stage 2 + 3: run naming in parallel with strategy (both depend on Discovery only)
        const namingPromise = (async () => {
          try { return await runNaming(); }
          catch { return { success: false as const, candidates: [], recommended: 0, errors: ["Naming failed"] }; }
        })();

        const [strategyResult, namingResult] = await Promise.all([strategyPromise, namingPromise]);

        if (strategyResult.success) {
          results.strategy = { archetypes: strategyResult.archetypes, emotionalTerritory: strategyResult.emotionalTerritory, values: strategyResult.values, toneSummary: strategyResult.toneSummary };
        } else { mockFallbackUsed = true; results.strategy = { ...generateMockStageResult(2, productInput), _mock: true }; }

        if (namingResult.success) {
          results.naming = { candidates: namingResult.candidates.slice(0, 5), recommended: namingResult.recommended };
        } else { mockFallbackUsed = true; results.naming = { ...generateMockStageResult(3, productInput), _mock: true }; }
      } else {
        // Only stage 2 needed
        const strategyResult = await strategyPromise;
        if (strategyResult.success) {
          results.strategy = { archetypes: strategyResult.archetypes, emotionalTerritory: strategyResult.emotionalTerritory, values: strategyResult.values, toneSummary: strategyResult.toneSummary };
        } else { mockFallbackUsed = true; results.strategy = { ...generateMockStageResult(2, productInput), _mock: true }; }
      }
    } else {
      results.strategy = { ...generateMockStageResult(2, productInput), _mock: true };
      if (targetStage >= 3) { results.naming = { ...generateMockStageResult(3, productInput), _mock: true }; }
    }

    if (targetStage <= 2) {
      return NextResponse.json({ success: true, stage: 2, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── Stage 3: Naming (may have run in parallel with Strategy) ─
    if (!results.naming && targetStage >= 3) {
      // Naming was not yet computed (only needed for stage >= 3 and not in mock mode)
      if (!mockMode) {
        try {
          const namingResult = await runNaming();
          if (namingResult.success) {
            results.naming = { candidates: namingResult.candidates.slice(0, 5), recommended: namingResult.recommended };
          } else { mockFallbackUsed = true; results.naming = { ...generateMockStageResult(3, productInput), _mock: true }; }
        } catch { mockFallbackUsed = true; results.naming = { ...generateMockStageResult(3, productInput), _mock: true }; }
      } else {
        results.naming = { ...generateMockStageResult(3, productInput), _mock: true };
      }
    }

    if (targetStage <= 3) {
      return NextResponse.json({ success: true, stage: 3, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── Stage 4: Colour + Typography (parallel) ────────
    if (!mockMode) {
      try {
        const [colourResult, typographyResult] = await Promise.all([
          runColourSystem(),
          runTypography(),
        ]);

        const mockStage = generateMockStageResult(4, productInput);
        results.visual = {
          colour: {
            primary: colourResult.success ? colourResult.primary : mockStage.primary,
            secondary: colourResult.success ? colourResult.secondary : mockStage.secondary,
            accent: colourResult.success ? colourResult.accent : mockStage.accent,
            harmony: colourResult.success ? colourResult.harmonyType : mockStage.harmonyType,
            wcag: colourResult.success ? (colourResult.wcagPassed ? "AA passed" : "AA failed") : "AA passed (mock)",
            _mock: !colourResult.success,
          },
          typography: {
            display: typographyResult.success ? typographyResult.displayFont : mockStage.displayFont,
            text: typographyResult.success ? typographyResult.textFont : mockStage.textFont,
            mono: typographyResult.success ? typographyResult.monoFont : mockStage.monoFont,
            scale: typographyResult.success ? typographyResult.typeScaleRatio : mockStage.typeScaleRatio,
            _mock: !typographyResult.success,
          },
        };
        if (!colourResult.success || !typographyResult.success) mockFallbackUsed = true;
      } catch {
        mockFallbackUsed = true;
        const mockStage = generateMockStageResult(4, productInput);
        results.visual = { ...mockStage, _mock: true };
      }
    } else {
      const mockStage = generateMockStageResult(4, productInput);
      results.visual = { ...mockStage, _mock: true };
    }

    if (targetStage <= 4) {
      return NextResponse.json({ success: true, stage: 4, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── Stage 5: Logo + Visual Identity ────────────────
    let logoUsedMock = false;
    try {
      const logoResult = await runLogo();
      results.logo = {
        typology: logoResult.typology,
        concepts: logoResult.concepts.length,
        success: logoResult.success,
      };
      if (!logoResult.success || (logoResult.errors?.length ?? 0) > 0) {
        logoUsedMock = true;
      }
    } catch {
      logoUsedMock = true;
      results.logo = { status: "fallback", _mock: true };
      // Populate BSO with mock logo so BCE passes
      const mockBSO = generateMockBSO(productInput, 5);
      if (mockBSO.visualIdentity?.logo) {
        getBsoStore().update("visualIdentity", { logo: mockBSO.visualIdentity.logo });
      }
    }

    // Iconography + Motion run deterministically (no AI call needed)
    const iconResult = runIconography();
    const motionResult = runMotion();

    const existingVisual = (results.visual as Record<string, unknown>) || {};
    results.visual = {
      ...existingVisual,
      iconography: iconResult.success ? {
        strokeWeight: iconResult.strokeWeight,
        cornerRadius: iconResult.cornerRadius,
        fillApproach: iconResult.fillApproach,
        icons: `${iconResult.coreIconCount} core + ${iconResult.featureIconCount} feature`,
      } : { status: "skipped" },
      motion: motionResult.success ? {
        duration: motionResult.duration,
        easing: motionResult.easing,
        style: motionResult.style,
        tokens: `${motionResult.tokenCount} reference animations`,
      } : { status: "skipped" },
    };

    // ─── Stage 6: Verbal Identity ───────────────────────
    if (!mockMode) {
      try {
        const verbalResult = await runVerbalIdentity();
        if (verbalResult.success) {
          results.verbal = {
            taglines: verbalResult.taglines.slice(0, 5),
            heroHeadline: verbalResult.heroHeadline,
            primaryCTA: verbalResult.primaryCTA,
          };
        } else {
          mockFallbackUsed = true;
          const mockStage = generateMockStageResult(6, productInput);
          results.verbal = { ...mockStage, _mock: true };
        }
      } catch {
        mockFallbackUsed = true;
        const mockStage = generateMockStageResult(6, productInput);
        results.verbal = { ...mockStage, _mock: true };
      }
    } else {
      const mockStage = generateMockStageResult(6, productInput);
      results.verbal = { ...mockStage, _mock: true };
    }

    // ─── Stage 7: Applications ──────────────────────────
    const appResult = runApplications();
    results.applications = {
      digital: appResult.digital.length,
      marketing: appResult.marketing.length,
      inProduct: appResult.inProduct.length,
      total: appResult.totalAssets,
    };

    if (targetStage <= 7) {
      return NextResponse.json({ success: true, stage: 7, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── Stage 8: Guidelines ────────────────────────────
    const guidelinesResult = runGuidelines();
    results.guidelines = {
      sections: guidelinesResult.sectionCount,
      totalWords: guidelinesResult.totalWords,
    };

    if (targetStage <= 8) {
      return NextResponse.json({ success: true, stage: 8, results, _mockFallback: mockFallbackUsed || mockMode });
    }

    // ─── BCE Validation ─────────────────────────────────
    // If real AI was unavailable, hydrate the BSO with mock data so BCE can run
    const bsoStore = getBsoStore();
    if (mockFallbackUsed || mockMode) {
      const mockBSO = generateMockBSO(productInput, 9);
      const currentBso = bsoStore.get();
      // Fill product data (especially competitors for BCE check 8)
      if (!currentBso.strategy?.positioning && mockBSO.strategy) {
        bsoStore.update("strategy", mockBSO.strategy);
      }
      if (!currentBso.visualIdentity?.colourSystem && mockBSO.visualIdentity?.colourSystem) {
        bsoStore.update("visualIdentity", {
          colourSystem: mockBSO.visualIdentity.colourSystem,
          typography: mockBSO.visualIdentity.typography,
          iconography: mockBSO.visualIdentity.iconography,
          illustrationStyle: mockBSO.visualIdentity.illustrationStyle,
          motionLanguage: mockBSO.visualIdentity.motionLanguage,
          logo: mockBSO.visualIdentity.logo,
        });
      }
      if (!currentBso.verbalIdentity?.naming && mockBSO.verbalIdentity) {
        bsoStore.update("verbalIdentity", mockBSO.verbalIdentity);
      }
      // Fill competitors from input if missing (needed for BCE check 8)
      if (!currentBso.product.competitors?.length && productInput.competitors?.length) {
        bsoStore.update("product", { competitors: productInput.competitors as Competitor[] });
      }
    }

    const bso = bsoStore.get();
    const consistencyEngine = getConsistencyEngine();
    const report = consistencyEngine.run(bso);

    results.consistency = {
      overall: report.overall,
      passed: report.passed,
      warnings: report.warnings,
      errors: report.errors,
      total: report.totalChecks,
      checks: report.checks.map((c) => ({
        name: c.name,
        status: c.status,
        details: c.details?.slice(0, 120),
      })),
    };

    // ─── Persist to Supabase (best-effort) ─────────────
    const bsoJson = getBsoStore().toJSON();
    const bsoParsed = JSON.parse(bsoJson) as BrandStateObject;

    // Save asynchronously but don't block response
    const savePromise = saveBrand(
      body.productName || body.name || "Untitled",
      body.description || "",
      9,
      bsoParsed
    ).catch(() => null);

    const response = NextResponse.json({
      success: true,
      stage: 9,
      results,
      bso: bsoParsed,
      _mockFallback: mockFallbackUsed || mockMode,
    });

    // Fire persistence — response is already enqueued
    await Promise.race([
      savePromise,
      new Promise((r) => setTimeout(r, 2000)), // 2s timeout so we never stall
    ]);

    return response;
  } catch (err) {
    console.error("VibeBranding pipeline error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/brand — return current BSO state
 */
export async function GET() {
  try {
    const store = getBsoStore();
    const bso = store.get();
    return NextResponse.json(bso);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
