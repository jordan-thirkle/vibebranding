/**
 * CSS Custom Properties Generator
 * Converts BSO colour, typography, and motion tokens into CSS custom properties.
 */

import type { ColourSystemInfo, TypographyInfo, MotionLanguageInfo } from "@/core/bso/types";

export function generateCSSVariables(
  colours: ColourSystemInfo,
  typography?: TypographyInfo,
  motion?: MotionLanguageInfo
): string {
  const lines: string[] = [
    "/* ═══════════════════════════════════════════════════ */",
    "/*  VibeBranding — Generated Brand Tokens              */",
    "/*  DO NOT EDIT DIRECTLY — regenerate from BSO          */",
    "/* ═══════════════════════════════════════════════════ */",
    "",
    ":root {",
  ];

  // ── Colour Tokens ──────────────────────────────────
  lines.push("  /* ── Brand Colours ── */");
  lines.push(`  --color-brand-primary: ${colours.primaryColour};`);
  lines.push(`  --color-brand-secondary: ${colours.secondaryColour};`);
  lines.push(`  --color-accent: ${colours.accentColour};`);

  lines.push("");
  lines.push("  /* ── Neutral Scale (50-950) ── */");
  for (const token of colours.neutralScale) {
    lines.push(`  --color-neutral-${token.name}: ${token.hex};`);
  }

  lines.push("");
  lines.push("  /* ── Semantic Colours ── */");
  for (const token of colours.semanticColours) {
    lines.push(`  --color-semantic-${token.name}: ${token.hex};`);
  }

  lines.push("");
  lines.push("  /* ── Surface Layers ── */");
  for (const token of colours.surfaceColours) {
    lines.push(`  --color-surface-${token.name}: ${token.hex};`);
  }

  lines.push("");
  lines.push("  /* ── Text Colours ── */");
  for (const token of colours.textColours) {
    lines.push(`  --color-text-${token.name}: ${token.hex};`);
  }

  // ── Typography Tokens ──────────────────────────────
  if (typography) {
    lines.push("");
    lines.push("  /* ── Typography ── */");
    lines.push(`  --font-display: ${typography.displayFont.fallbackStack};`);
    lines.push(`  --font-text: ${typography.textFont.fallbackStack};`);
    if (typography.monoFont) {
      lines.push(`  --font-mono: ${typography.monoFont.fallbackStack};`);
    }

    for (const scale of typography.typeScale.sizes) {
      lines.push(`  --type-scale-${scale.name}: ${scale.sizeRem}rem;`);
      lines.push(`  --type-scale-${scale.name}-line-height: ${scale.lineHeight};`);
    }
  }

  // ── Motion Tokens ──────────────────────────────────
  if (motion?.tokens) {
    lines.push("");
    lines.push("  /* ── Motion ── */");
    lines.push(motion.tokens.css);
  }

  lines.push("}");
  lines.push("");

  // ── Dark Mode Overrides ────────────────────────────
  lines.push("/* ── Dark Mode ── */");
  lines.push('[data-theme="dark"] {');
  for (const token of colours.neutralScale) {
    lines.push(`  --color-neutral-${token.name}: ${token.darkMode};`);
  }
  for (const token of colours.semanticColours) {
    lines.push(`  --color-semantic-${token.name}: ${token.darkMode};`);
  }
  for (const token of colours.textColours) {
    lines.push(`  --color-text-${token.name}: ${token.darkMode};`);
  }
  lines.push("}");

  return lines.join("\n");
}

export function generateCSSFile(
  colours: ColourSystemInfo,
  typography?: TypographyInfo,
  motion?: MotionLanguageInfo
): { filename: string; content: string } {
  return {
    filename: "brand-tokens.css",
    content: generateCSSVariables(colours, typography, motion),
  };
}
