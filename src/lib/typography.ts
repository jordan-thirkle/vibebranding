/**
 * Typography Library for VibeBranding.
 *
 * Implements mathematical type systems:
 * - Type scale generators (Major Third, Perfect Fourth, Augmented Fourth, Minor Third)
 * - Font pairing logic (x-height compatibility, contrast balance)
 * - Line length and legibility calculations
 * - CSS variable generation
 */

// ─── Type Scale Generator ────────────────────────────────────

export type ScaleRatio = "major_third" | "perfect_fourth" | "augmented_fourth" | "minor_third";

export interface TypeScaleStep {
  name: string;
  sizePx: number;
  sizeRem: number;
  lineHeight: number;
  usage: string;
}

export interface TypeScale {
  ratio: number;
  ratioName: ScaleRatio;
  baseSizePx: number;
  steps: TypeScaleStep[];
}

const SCALE_RATIOS: Record<ScaleRatio, number> = {
  major_third: 1.25,
  perfect_fourth: 1.333,
  augmented_fourth: 1.414,
  minor_third: 1.2,
};

const STEP_NAMES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "display"];
const STEP_USAGES: Record<string, string> = {
  xs: "Captions, legal text, fine print",
  sm: "Body small, labels, metadata",
  base: "Body text, paragraphs, UI copy",
  lg: "Lead paragraphs, featured text",
  xl: "Section headings, card titles",
  "2xl": "Page headings, section titles",
  "3xl": "Hero subheadings",
  "4xl": "Hero headlines",
  display: "Marketing display text (clamp-based)",
};

export function generateTypeScale(
  basePx: number = 16,
  ratio: ScaleRatio = "major_third"
): TypeScale {
  const r = SCALE_RATIOS[ratio];
  const steps: TypeScaleStep[] = [];

  // Start from a power that ensures minimum step >= 11px (BCE legibility requirement)
  let startPower = -2;
  if (Math.round(basePx * Math.pow(r, startPower)) < 11) {
    startPower = -1;
  }
  const endPower = startPower + 8; // Always generate 9 steps

  for (let i = 0; i < STEP_NAMES.length; i++) {
    const power = startPower + i;
    const sizePx = Math.round(basePx * Math.pow(r, power));
    const sizeRem = Math.round((sizePx / 16) * 1000) / 1000;

    // Line height: larger for body, tighter for display
    let lineHeight: number;
    if (sizePx <= 14) lineHeight = 1.5;
    else if (sizePx <= 20) lineHeight = 1.5;
    else if (sizePx <= 32) lineHeight = 1.3;
    else if (sizePx <= 48) lineHeight = 1.2;
    else lineHeight = 1.1;

    steps.push({
      name: STEP_NAMES[i],
      sizePx,
      sizeRem,
      lineHeight: Math.round(lineHeight * 100) / 100,
      usage: STEP_USAGES[STEP_NAMES[i]] || "",
    });
  }

  return {
    ratio: r,
    ratioName: ratio,
    baseSizePx: basePx,
    steps,
  };
}

// ─── Font Pairing Logic ──────────────────────────────────────

export type FontClassification =
  | "geometric_sans"
  | "humanist_sans"
  | "grotesque_sans"
  | "transitional_serif"
  | "display_variable"
  | "mono";

export interface FontRecommendation {
  name: string;
  classification: FontClassification;
  source: "google" | "adobe" | "system";
  weights: number[];
  isVariable: boolean;
  bestFor: string;
  avoidIf: string;
}

// Curated font recommendations (avoiding overused defaults)
export const FONT_RECOMMENDATIONS: FontRecommendation[] = [
  {
    name: "DM Sans",
    classification: "geometric_sans",
    source: "google",
    weights: [400, 500, 700],
    isVariable: true,
    bestFor: "Modern, tech-forward brands. Clean geometric forms.",
    avoidIf: "Brand needs a traditional or warm feel.",
  },
  {
    name: "Space Grotesk",
    classification: "geometric_sans",
    source: "google",
    weights: [300, 400, 500, 600, 700],
    isVariable: true,
    bestFor: "Bold, distinctive tech brands. Unique character.",
    avoidIf: "Conservative or financial brands.",
  },
  {
    name: "Satoshi",
    classification: "geometric_sans",
    source: "google",
    weights: [300, 400, 500, 700, 900],
    isVariable: true,
    bestFor: "Contemporary SaaS, developer tools.",
    avoidIf: "Brand needs serif warmth.",
  },
  {
    name: "Source Sans 3",
    classification: "humanist_sans",
    source: "google",
    weights: [200, 300, 400, 500, 600, 700, 900],
    isVariable: true,
    bestFor: "Accessible, human-centric brands. Great body text.",
    avoidIf: "Brand needs ultra-modern edge.",
  },
  {
    name: "Public Sans",
    classification: "humanist_sans",
    source: "google",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isVariable: true,
    bestFor: "Government, institutional, trustworthy brands.",
    avoidIf: "Playful or creative brands.",
  },
  {
    name: "Plus Jakarta Sans",
    classification: "humanist_sans",
    source: "google",
    weights: [200, 300, 400, 500, 600, 700, 800],
    isVariable: true,
    bestFor: "Modern SaaS, clean dashboards, friendly tone.",
    avoidIf: "Heritage or luxury brands.",
  },
  {
    name: "Merriweather",
    classification: "transitional_serif",
    source: "google",
    weights: [300, 400, 700, 900],
    isVariable: false,
    bestFor: "Authority, heritage, editorial content. Great body text.",
    avoidIf: "Ultra-modern tech brands.",
  },
  {
    name: "Source Serif 4",
    classification: "transitional_serif",
    source: "google",
    weights: [200, 300, 400, 500, 600, 700, 900],
    isVariable: true,
    bestFor: "Professional services, publishing, thought leadership.",
    avoidIf: "Playful or irreverent brands.",
  },
  {
    name: "Clash Display",
    classification: "display_variable",
    source: "google",
    weights: [200, 300, 400, 500, 600, 700],
    isVariable: true,
    bestFor: "Expressive headlines, editorial moments, bold identity.",
    avoidIf: "Data-heavy UIs, body text (use for display only).",
  },
  {
    name: "JetBrains Mono",
    classification: "mono",
    source: "google",
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    isVariable: true,
    bestFor: "Code, data, technical interfaces, developer tools.",
    avoidIf: "Consumer marketing copy.",
  },
];

export function recommendFonts(
  archetypes: string[],
  modernVsClassic: number
): { display: FontRecommendation[]; text: FontRecommendation[] } {
  const isModern = modernVsClassic > 50;
  const isPlayful = archetypes.some((a) =>
    ["Jester", "Creator", "Explorer"].includes(a)
  );
  const isAuthoritative = archetypes.some((a) =>
    ["Sage", "Ruler"].includes(a)
  );

  let displayPool: FontRecommendation[];
  let textPool: FontRecommendation[];

  if (isPlayful && isModern) {
    displayPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["geometric_sans", "display_variable"].includes(f.classification)
    );
    textPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["geometric_sans", "humanist_sans"].includes(f.classification)
    );
  } else if (isAuthoritative) {
    displayPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["transitional_serif", "geometric_sans"].includes(f.classification)
    );
    textPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["humanist_sans", "transitional_serif"].includes(f.classification)
    );
  } else {
    displayPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["geometric_sans", "humanist_sans", "display_variable"].includes(f.classification)
    );
    textPool = FONT_RECOMMENDATIONS.filter((f) =>
      ["humanist_sans", "geometric_sans"].includes(f.classification)
    );
  }

  return {
    display: displayPool.slice(0, 5),
    text: textPool.slice(0, 5),
  };
}

// ─── Line Length Calculator ──────────────────────────────────

export function calculateMaxLineLength(fontSizePx: number, charactersPerLine: number = 75): string {
  // Approximate: average character width ≈ 0.5 × font size
  const maxWidthPx = fontSizePx * 0.55 * charactersPerLine;
  const maxWidthRem = maxWidthPx / 16;
  return `${maxWidthRem.toFixed(2)}rem`;
}

// ─── CSS Variable Generator ──────────────────────────────────

export function generateTypeScaleCSS(scale: TypeScale): string {
  const lines: string[] = ["/* VibeBranding — Type Scale Tokens */", ":root {"];

  for (const step of scale.steps) {
    const varName = `--type-scale-${step.name}`;
    lines.push(`  ${varName}: ${step.sizeRem}rem;`);
    lines.push(`  --type-scale-${step.name}-line-height: ${step.lineHeight};`);
  }

  lines.push("}");
  return lines.join("\n");
}

// ─── Fallback Stack Builder ──────────────────────────────────

export function buildFallbackStack(font: FontRecommendation): string {
  const base = `'${font.name}'`;

  switch (font.classification) {
    case "geometric_sans":
      return `${base}, system-ui, -apple-system, 'Segoe UI', sans-serif`;
    case "humanist_sans":
      return `${base}, system-ui, -apple-system, 'Segoe UI', sans-serif`;
    case "grotesque_sans":
      return `${base}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    case "transitional_serif":
      return `${base}, Georgia, 'Times New Roman', serif`;
    case "display_variable":
      return `${base}, system-ui, -apple-system, sans-serif`;
    case "mono":
      return `${base}, 'Cascadia Code', 'Fira Code', 'Consolas', monospace`;
    default:
      return `${base}, sans-serif`;
  }
}
