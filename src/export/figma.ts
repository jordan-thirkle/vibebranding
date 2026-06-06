/**
 * Figma Styles JSON Generator
 * Produces Figma-compatible colour styles and text styles for import.
 */

import type { ColourSystemInfo, TypographyInfo } from "@/core/bso/types";

export interface FigmaStyles {
  version: string;
  colourStyles: FigmaColourStyle[];
  textStyles: FigmaTextStyle[];
}

export interface FigmaColourStyle {
  name: string;
  description: string;
  fills: Array<{
    type: "SOLID";
    color: { r: number; g: number; b: number };
    opacity: number;
  }>;
}

export interface FigmaTextStyle {
  name: string;
  fontName: {
    family: string;
    style: string;
  };
  fontSize: number;
  lineHeight: { value: number; unit: "PIXELS" | "PERCENT" };
  letterSpacing: { value: number; unit: "PIXELS" | "PERCENT" };
}

export function generateFigmaStyles(
  colours: ColourSystemInfo,
  typography?: TypographyInfo
): FigmaStyles {
  const colourStyles: FigmaColourStyle[] = [];
  const textStyles: FigmaTextStyle[] = [];

  // Helper: hex → Figma RGBA
  function hexToFigmaRgba(hex: string): { r: number; g: number; b: number } {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }

  // ── Colour Styles ──────────────────────────────────
  colourStyles.push({
    name: "Brand/Primary",
    description: "Main brand colour (60% usage)",
    fills: [{ type: "SOLID", color: hexToFigmaRgba(colours.primaryColour), opacity: 1 }],
  });
  colourStyles.push({
    name: "Brand/Secondary",
    description: "Supporting colour (30% usage)",
    fills: [{ type: "SOLID", color: hexToFigmaRgba(colours.secondaryColour), opacity: 1 }],
  });
  colourStyles.push({
    name: "Brand/Accent",
    description: "CTA and highlight colour (10% usage)",
    fills: [{ type: "SOLID", color: hexToFigmaRgba(colours.accentColour), opacity: 1 }],
  });

  for (const token of colours.neutralScale) {
    colourStyles.push({
      name: `Neutral/${token.name}`,
      description: `Neutral scale — stop ${token.name}`,
      fills: [{ type: "SOLID", color: hexToFigmaRgba(token.hex), opacity: 1 }],
    });
  }

  // ── Text Styles ────────────────────────────────────
  if (typography) {
    for (const scale of typography.typeScale.sizes) {
      textStyles.push({
        name: `Type/${scale.name}`,
        fontName: {
          family: scale.sizePx >= 24 ? typography.displayFont.name : typography.textFont.name,
          style: scale.sizePx >= 24 ? "Bold" : "Regular",
        },
        fontSize: scale.sizePx,
        lineHeight: { value: scale.lineHeight * scale.sizePx, unit: "PIXELS" },
        letterSpacing: { value: 0, unit: "PERCENT" },
      });
    }
  }

  return { version: "1.0.0", colourStyles, textStyles };
}

export function generateFigmaFile(
  colours: ColourSystemInfo,
  typography?: TypographyInfo
): { filename: string; content: string } {
  return {
    filename: "figma-styles.json",
    content: JSON.stringify(generateFigmaStyles(colours, typography), null, 2),
  };
}
