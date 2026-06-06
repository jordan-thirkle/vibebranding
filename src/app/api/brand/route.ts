/**
 * VibeBranding API — Full Brand Generation Pipeline
 *
 * POST /api/brand
 * Body: { productName, description, category, ... }
 *
 * Runs stages 1-9 sequentially, returning results at each stage.
 * Supports partial execution via the `stage` query param.
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

// Register all prompt templates once at module load
registerAllTemplates(getPromptEngine());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const targetStage = parseInt(searchParams.get("stage") || "9", 10);

    // Reset BSO for fresh generation
    resetBsoStore();

    const results: Record<string, unknown> = {};

    // ─── Stage 1: Discovery ────────────────────────────
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

    if (!discoveryResult.success) {
      return NextResponse.json({ success: false, stage: 1, errors: discoveryResult.errors }, { status: 400 });
    }

    results.discovery = {
      positioning: discoveryResult.positioningStatement,
      audiencePersona: discoveryResult.audiencePersona?.slice(0, 200),
    };

    if (targetStage <= 1) {
      return NextResponse.json({ success: true, stage: 1, results });
    }

    // ─── Stage 2: Strategy ──────────────────────────────
    const strategyResult = await runStrategy();

    if (!strategyResult.success) {
      return NextResponse.json({ success: false, stage: 2, errors: strategyResult.errors }, { status: 400 });
    }

    results.strategy = {
      archetypes: strategyResult.archetypes,
      emotionalTerritory: strategyResult.emotionalTerritory,
      values: strategyResult.values,
      toneSummary: strategyResult.toneSummary,
    };

    if (targetStage <= 2) {
      return NextResponse.json({ success: true, stage: 2, results });
    }

    // ─── Stage 3: Naming ────────────────────────────────
    const namingResult = await runNaming();

    if (!namingResult.success) {
      return NextResponse.json({ success: false, stage: 3, errors: namingResult.errors }, { status: 400 });
    }

    results.naming = {
      candidates: namingResult.candidates.slice(0, 5),
      recommended: namingResult.recommended,
    };

    if (targetStage <= 3) {
      return NextResponse.json({ success: true, stage: 3, results });
    }

    // ─── Stage 4: Colour + Typography (parallel) ────────
    const [colourResult, typographyResult] = await Promise.all([
      runColourSystem(),
      runTypography(),
    ]);

    if (!colourResult.success) {
      return NextResponse.json({ success: false, stage: 4, errors: colourResult.errors }, { status: 400 });
    }

    if (!typographyResult.success) {
      return NextResponse.json({ success: false, stage: 4, errors: typographyResult.errors }, { status: 400 });
    }

    results.visual = {
      colour: {
        primary: colourResult.primary,
        secondary: colourResult.secondary,
        accent: colourResult.accent,
        harmony: colourResult.harmonyType,
        wcag: colourResult.wcagPassed ? "AA passed" : "AA failed",
      },
      typography: {
        display: typographyResult.displayFont,
        text: typographyResult.textFont,
        mono: typographyResult.monoFont,
        scale: typographyResult.typeScaleRatio,
      },
    };

    if (targetStage <= 4) {
      return NextResponse.json({ success: true, stage: 4, results });
    }

    // ─── Stage 5: Logo + Visual Identity ────────────────
    // (Logo generation is heavy — runs separately via /api/brand/logo)
    results.logo = { status: "generating", note: "Logo generation runs via Replicate. Enable billing for Recraft SVG." };

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
    const verbalResult = await runVerbalIdentity();

    if (!verbalResult.success) {
      return NextResponse.json({ success: false, stage: 6, errors: verbalResult.errors }, { status: 400 });
    }

    results.verbal = {
      taglines: verbalResult.taglines.slice(0, 5),
      heroHeadline: verbalResult.heroHeadline,
      primaryCTA: verbalResult.primaryCTA,
    };

    // ─── Stage 7: Applications ──────────────────────────
    const appResult = runApplications();

    results.applications = {
      digital: appResult.digital.length,
      marketing: appResult.marketing.length,
      inProduct: appResult.inProduct.length,
      total: appResult.totalAssets,
    };

    if (targetStage <= 7) {
      return NextResponse.json({ success: true, stage: 7, results });
    }

    // ─── Stage 8: Guidelines ────────────────────────────
    const guidelinesResult = runGuidelines();

    results.guidelines = {
      sections: guidelinesResult.sectionCount,
      totalWords: guidelinesResult.totalWords,
    };

    if (targetStage <= 8) {
      return NextResponse.json({ success: true, stage: 8, results });
    }

    // ─── BCE Validation ─────────────────────────────────
    const bso = getBsoStore().get();
    const consistencyEngine = getConsistencyEngine();
    const report = consistencyEngine.run(bso);

    results.consistency = {
      overall: report.overall,
      passed: report.passed,
      warnings: report.warnings,
      errors: report.errors,
      total: report.totalChecks,
    };

    // ─── Export BSO ─────────────────────────────────────
    const bsoJson = getBsoStore().toJSON();

    return NextResponse.json({
      success: true,
      stage: 9,
      results,
      bso: JSON.parse(bsoJson),
    });
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
