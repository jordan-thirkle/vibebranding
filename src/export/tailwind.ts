/**
 * Tailwind CSS Config Generator
 * Generates a Tailwind v4 theme extension from BSO tokens.
 */

import type { ColourSystemInfo, TypographyInfo } from "@/core/bso/types";

export function generateTailwindConfig(
  colours: ColourSystemInfo,
  typography?: TypographyInfo
): string {
  const lines: string[] = [
    "// VibeBranding — Generated Tailwind v4 Config Extension",
    "// Merge into your tailwind.config.ts or CSS @theme block",
    "",
    "import type { Config } from 'tailwindcss'",
    "",
    "export const brandTheme = {",
  ];

  // ── Colours ────────────────────────────────────────
  lines.push("  theme: {");
  lines.push("    extend: {");
  lines.push("      colors: {");
  lines.push(`        brand: {`);
  lines.push(`          primary: '${colours.primaryColour}',`);
  lines.push(`          secondary: '${colours.secondaryColour}',`);
  lines.push(`          accent: '${colours.accentColour}',`);
  lines.push(`        },`);

  // Neutral scale
  lines.push("        neutral: {");
  for (const token of colours.neutralScale) {
    lines.push(`          ${token.name}: '${token.hex}',`);
  }
  lines.push("        },");

  // Semantic
  for (const token of colours.semanticColours) {
    lines.push(`        ${token.name}: '${token.hex}',`);
  }

  lines.push("      },");

  // ── Typography ────────────────────────────────────
  if (typography) {
    lines.push("      fontFamily: {");
    lines.push(`        display: ['${typography.displayFont.name}', ...fallbackToArray('${typography.displayFont.fallbackStack}')],`);
    lines.push(`        text: ['${typography.textFont.name}', ...fallbackToArray('${typography.textFont.fallbackStack}')],`);
    if (typography.monoFont) {
      lines.push(`        mono: ['${typography.monoFont.name}', ...fallbackToArray('${typography.monoFont.fallbackStack}')],`);
    }
    lines.push("      },");

    lines.push("      fontSize: {");
    for (const scale of typography.typeScale.sizes) {
      lines.push(`        '${scale.name}': ['${scale.sizeRem}rem', { lineHeight: '${scale.lineHeight}' }],`);
    }
    lines.push("      },");
  }

  lines.push("    },");
  lines.push("  },");
  lines.push("} satisfies Partial<Config>;");

  return lines.join("\n");
}

export function generateTailwindFile(
  colours: ColourSystemInfo,
  typography?: TypographyInfo
): { filename: string; content: string } {
  return {
    filename: "tailwind-brand.config.ts",
    content: generateTailwindConfig(colours, typography),
  };
}
