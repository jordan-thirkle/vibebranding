/**
 * SCSS Variables Generator
 * Converts BSO tokens into SCSS variable format.
 */

import type { ColourSystemInfo, TypographyInfo, MotionLanguageInfo } from "@/core/bso/types";

export function generateSCSSVariables(
  colours: ColourSystemInfo,
  typography?: TypographyInfo,
  motion?: MotionLanguageInfo
): string {
  const lines: string[] = [
    "// ═══════════════════════════════════════════════════",
    "//  VibeBranding — Generated SCSS Tokens",
    "// ═══════════════════════════════════════════════════",
    "",
    "// ── Brand Colours ──",
    `$brand-primary: ${colours.primaryColour};`,
    `$brand-secondary: ${colours.secondaryColour};`,
    `$brand-accent: ${colours.accentColour};`,
    "",
    "// ── Neutral Scale ──",
  ];

  for (const token of colours.neutralScale) {
    lines.push(`$neutral-${token.name}: ${token.hex};`);
  }

  lines.push("", "// ── Semantic Colours ──");
  for (const token of colours.semanticColours) {
    lines.push(`$${token.name}: ${token.hex};`);
  }

  if (typography) {
    lines.push("", "// ── Typography ──");
    lines.push(`$font-display: ${typography.displayFont.fallbackStack};`);
    lines.push(`$font-text: ${typography.textFont.fallbackStack};`);
    if (typography.monoFont) {
      lines.push(`$font-mono: ${typography.monoFont.fallbackStack};`);
    }
    for (const scale of typography.typeScale.sizes) {
      lines.push(`$type-scale-${scale.name}: ${scale.sizeRem}rem;`);
    }
  }

  if (motion?.tokens) {
    lines.push("", "// ── Motion ──");
    const cssTokens = motion.tokens.css
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("--"))
      .map((l) => l.replace("--", "$").replace(": ", ": "));

    lines.push(...cssTokens);
  }

  return lines.join("\n");
}

export function generateSCSSFile(
  colours: ColourSystemInfo,
  typography?: TypographyInfo,
  motion?: MotionLanguageInfo
): { filename: string; content: string } {
  return {
    filename: "_brand-tokens.scss",
    content: generateSCSSVariables(colours, typography, motion),
  };
}
