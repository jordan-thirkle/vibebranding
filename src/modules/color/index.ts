/**
 * Colour System Module (Stage 4)
 *
 * Constructs a complete, accessible colour system using formal colour theory.
 * Generates: primary/secondary/accent, neutral scale, semantic colours,
 * surface layers, text colours, dark mode pairs, WCAG compliance.
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateStructuredWithGemini, getGeminiConfig } from "@/ai/gemini";
import {
  generateHarmony,
  generateNeutralScale,
  generateDarkModePair,
  getContrastRatio,
  suggestColourFromTerritory,
  type HarmonyType,
} from "@/lib/color-theory";
import type { ColourSystemInfo, ColourToken, WcagCheck, VisualIdentityInfo } from "@/core/bso/types";

export interface ColourOutput {
  success: boolean;
  primary: string;
  secondary: string;
  accent: string;
  harmonyType: string;
  wcagPassed: boolean;
  errors?: string[];
}

/**
 * Run the Colour System pipeline.
 */
export async function runColourSystem(): Promise<ColourOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const config = getGeminiConfig();
  const bso = store.get();

  if (!bso.strategy.personalityArchetypes.length) {
    return {
      success: false, primary: "", secondary: "", accent: "", harmonyType: "", wcagPassed: false,
      errors: ["Strategy data incomplete. Run Stage 2 (Strategy) first."],
    };
  }

  // Suggest base colour from emotional territory
  const baseColour = suggestColourFromTerritory(bso.strategy.emotionalTerritory);

  // Determine harmony type from archetype personality
  const archetypeNames = bso.strategy.personalityArchetypes.map((a) => a.archetype);
  const harmonyType = determineHarmonyType(archetypeNames, bso.strategy.personalitySpectrum.boldVsUnderstated);

  // Generate harmony palette
  const harmony = generateHarmony(baseColour, harmonyType);
  const primary = harmony[0];
  const secondary = harmony[1] || "#475569";
  const accent = harmony[2] || "#F59E0B";

  // Generate neutral scale (subtly tinted to primary hue)
  const { h: primaryHue } = (await import("@/lib/color-theory")).hexToHsl(primary);
  const neutralScale = generateNeutralScale(primaryHue, 3);

  // Generate dark mode pairs
  const neutralTokens: ColourToken[] = neutralScale.map((hex, i) => {
    const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    return {
      name: String(stops[i]),
      hex,
      hsl: "", // computed later in UI
      role: `Neutral ${stops[i]}`,
      lightMode: hex,
      darkMode: generateDarkModePair(hex),
    };
  });

  // Semantic colours
  const semanticColours: ColourToken[] = [
    { name: "success", hex: "#10B981", hsl: "", role: "Success", lightMode: "#10B981", darkMode: "#34D399" },
    { name: "warning", hex: "#F59E0B", hsl: "", role: "Warning", lightMode: "#F59E0B", darkMode: "#FBBF24" },
    { name: "error", hex: "#EF4444", hsl: "", role: "Error", lightMode: "#EF4444", darkMode: "#F87171" },
    { name: "info", hex: "#3B82F6", hsl: "", role: "Info", lightMode: "#3B82F6", darkMode: "#60A5FA" },
  ];

  // Text colours
  const textColours: ColourToken[] = [
    { name: "primary", hex: neutralTokens[8]?.hex || "#0F172A", hsl: "", role: "Text primary", lightMode: "#0F172A", darkMode: "#F8FAFC" },
    { name: "secondary", hex: neutralTokens[5]?.hex || "#475569", hsl: "", role: "Text secondary", lightMode: "#475569", darkMode: "#94A3B8" },
    { name: "disabled", hex: neutralTokens[3]?.hex || "#94A3B8", hsl: "", role: "Text disabled", lightMode: "#94A3B8", darkMode: "#64748B" },
  ];

  // Surface colours
  const surfaceColours: ColourToken[] = [
    { name: "1", hex: "#FFFFFF", hsl: "", role: "Surface 1", lightMode: "#FFFFFF", darkMode: neutralTokens[8]?.hex || "#0F172A" },
    { name: "2", hex: neutralTokens[0]?.hex || "#F8FAFC", hsl: "", role: "Surface 2", lightMode: neutralTokens[0]?.hex || "#F8FAFC", darkMode: neutralTokens[7]?.hex || "#1E293B" },
    { name: "3", hex: neutralTokens[1]?.hex || "#F1F5F9", hsl: "", role: "Surface 3", lightMode: neutralTokens[1]?.hex || "#F1F5F9", darkMode: neutralTokens[6]?.hex || "#334155" },
    { name: "4", hex: neutralTokens[2]?.hex || "#E2E8F0", hsl: "", role: "Surface 4", lightMode: neutralTokens[2]?.hex || "#E2E8F0", darkMode: neutralTokens[5]?.hex || "#475569" },
    { name: "5", hex: neutralTokens[3]?.hex || "#CBD5E1", hsl: "", role: "Surface 5", lightMode: neutralTokens[3]?.hex || "#CBD5E1", darkMode: neutralTokens[4]?.hex || "#64748B" },
  ];

  // WCAG checks
  const wcagChecks: WcagCheck[] = [
    {
      foreground: textColours[0].lightMode,
      background: "#FFFFFF",
      contrastRatio: getContrastRatio(textColours[0].lightMode, "#FFFFFF"),
      normalTextPass: getContrastRatio(textColours[0].lightMode, "#FFFFFF") >= 4.5,
      largeTextPass: true,
    },
    {
      foreground: "#FFFFFF",
      background: primary,
      contrastRatio: getContrastRatio("#FFFFFF", primary),
      normalTextPass: getContrastRatio("#FFFFFF", primary) >= 4.5,
      largeTextPass: true,
    },
  ];

  const allPass = wcagChecks.every((c) => c.normalTextPass);

  // Generate CSS token block
  const cssTokens = `  --color-brand-primary: ${primary};
  --color-brand-secondary: ${secondary};
  --color-accent: ${accent};`;

  // Update BSO
  const colourSystem: ColourSystemInfo = {
    harmonyType,
    primaryColour: primary,
    secondaryColour: secondary,
    accentColour: accent,
    neutralScale: neutralTokens,
    semanticColours,
    surfaceColours,
    textColours,
    distribution: { primaryPercent: 60, secondaryPercent: 30, accentPercent: 10 },
    wcagReport: { overall: allPass ? "pass" : "fail", checks: wcagChecks },
    tokens: { css: cssTokens, tailwind: "", scss: "" },
  };

  store.update("visualIdentity", { colourSystem } as Partial<VisualIdentityInfo>);

  return {
    success: true,
    primary,
    secondary,
    accent,
    harmonyType,
    wcagPassed: allPass,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function determineHarmonyType(archetypes: string[], boldness: number): HarmonyType {
  const playfulArchetypes = ["Jester", "Creator", "Explorer", "Outlaw"];
  const seriousArchetypes = ["Sage", "Ruler", "Innocent"];
  const isPlayful = archetypes.some((a) => playfulArchetypes.includes(a));
  const isSerious = archetypes.some((a) => seriousArchetypes.includes(a));

  if (isPlayful && boldness > 70) return "complementary";
  if (isPlayful) return "triadic";
  if (isSerious) return "monochromatic";
  return "analogous";
}
