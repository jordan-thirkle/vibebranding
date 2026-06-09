/**
 * Typography Module (Stage 4)
 *
 * Selects and scales fonts using mathematical type systems.
 * Generates font pairings, type scale tokens, CSS/Tailwind output.
 * Runs in parallel with Colour System.
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateTypeScale, recommendFonts, buildFallbackStack, type ScaleRatio, type FontRecommendation } from "@/lib/typography";
import type { TypographyInfo, FontSelection, VisualIdentityInfo } from "@/core/bso/types";

export interface TypographyOutput {
  success: boolean;
  displayFont: string;
  textFont: string;
  monoFont?: string;
  typeScaleRatio: string;
  errors?: string[];
}

/**
 * Run the Typography pipeline.
 */
export async function runTypography(): Promise<TypographyOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const bso = store.get();

  if (!bso.strategy.personalityArchetypes.length) {
    return {
      success: false, displayFont: "", textFont: "", typeScaleRatio: "",
      errors: ["Strategy data incomplete. Run Stage 2 (Strategy) first."],
    };
  }

  // Determine personality
  const archetypeNames = bso.strategy.personalityArchetypes.map((a) => a.archetype);
  const modernVsClassic = bso.strategy.personalitySpectrum.modernVsClassic;

  // Get font recommendations
  const { display, text } = recommendFonts(archetypeNames, modernVsClassic);

  // Pick best display + text pairing
  const displayFont: FontRecommendation = findBestDisplay(display, archetypeNames);
  const textFont: FontRecommendation = findBestText(text, displayFont);

  // Determine if mono font needed (for developer tools, technical products)
  const isDevTool = bso.product.category?.toLowerCase().includes("developer") ||
    bso.product.category?.toLowerCase().includes("tool") ||
    bso.product.category?.toLowerCase().includes("code");

  const scaleRatio = determineScaleRatio(archetypeNames);
  const typeScale = generateTypeScale(16, scaleRatio);

  // Build font selections
  const displaySelection: FontSelection = {
    name: displayFont.name,
    classification: displayFont.classification,
    source: displayFont.source,
    weights: displayFont.weights,
    isVariable: displayFont.isVariable,
    fallbackStack: buildFallbackStack(displayFont),
    rationale: displayFont.bestFor,
    embedCode: `@import url('https://fonts.googleapis.com/css2?family=${displayFont.name.replace(/ /g, "+")}:wght@${displayFont.weights.join(";")}&display=swap');`,
  };

  const textSelection: FontSelection = {
    name: textFont.name,
    classification: textFont.classification,
    source: textFont.source,
    weights: textFont.weights,
    isVariable: textFont.isVariable,
    fallbackStack: buildFallbackStack(textFont),
    rationale: textFont.bestFor,
    embedCode: `@import url('https://fonts.googleapis.com/css2?family=${textFont.name.replace(/ /g, "+")}:wght@${textFont.weights.join(";")}&display=swap');`,
  };

  const monoSelection: FontSelection | undefined = isDevTool
    ? {
        name: "JetBrains Mono",
        classification: "mono",
        source: "google",
        weights: [400, 500, 700],
        isVariable: true,
        fallbackStack: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
        rationale: "Developer tool — mono font for code and data displays",
      }
    : undefined;

  // Convert lib TypeScale to BSO TypeScale format
  const bsoTypeScale = {
    ratio: typeScale.ratio,
    ratioName: typeScale.ratioName,
    sizes: typeScale.steps,
  };
  const cssTokens = `  --font-display: ${displaySelection.fallbackStack};
  --font-text: ${textSelection.fallbackStack};${monoSelection ? `\n  --font-mono: ${monoSelection.fallbackStack};` : ""}`;

  // Update BSO
  const typography: TypographyInfo = {
    displayFont: displaySelection,
    textFont: textSelection,
    monoFont: monoSelection,
    typeScale: bsoTypeScale,
    pairingRationale: `${displayFont.name} (${displayFont.classification}) + ${textFont.name} (${textFont.classification}): ${displayFont.bestFor}`,
    tokens: { css: cssTokens, tailwind: "" },
  };

  store.update("visualIdentity", { typography } as Partial<VisualIdentityInfo>);

  return {
    success: true,
    displayFont: displayFont.name,
    textFont: textFont.name,
    monoFont: monoSelection?.name,
    typeScaleRatio: scaleRatio,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function findBestDisplay(pool: FontRecommendation[], archetypes: string[]): FontRecommendation {
  const isBold = archetypes.includes("Hero") || archetypes.includes("Outlaw");
  const isRefined = archetypes.includes("Sage") || archetypes.includes("Ruler");

  if (isBold) {
    const bold = pool.find((f) => f.name === "Clash Display") || pool.find((f) => f.name === "Space Grotesk");
    if (bold) return bold;
  }

  if (isRefined) {
    const refined = pool.find((f) => f.name === "DM Sans");
    if (refined) return refined;
  }

  return pool[0];
}

function findBestText(pool: FontRecommendation[], displayFont: FontRecommendation): FontRecommendation {
  // Don't pair same classification
  const different = pool.find((f) => f.classification !== displayFont.classification);
  if (different) return different;

  // Don't pair same name
  const differentName = pool.find((f) => f.name !== displayFont.name);
  return differentName || pool[0];
}

function determineScaleRatio(archetypes: string[]): ScaleRatio {
  const bold = ["Hero", "Jester", "Outlaw", "Explorer"];
  const editorial = ["Sage", "Lover", "Magician"];

  if (archetypes.some((a) => bold.includes(a))) return "perfect_fourth";
  if (archetypes.some((a) => editorial.includes(a))) return "augmented_fourth";
  return "major_third";
}
