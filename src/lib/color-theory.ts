/**
 * Colour Theory Library for VibeBranding.
 *
 * Implements formal colour theory algorithms:
 * - Colour psychology → archetype mapping
 * - Harmony type generation (complementary, split-complementary, triadic, etc.)
 * - 60-30-10 palette distribution
 * - WCAG 2.1 AA contrast ratio calculation
 * - HSL colour manipulation
 * - Neutral scale generation (50-950)
 * - Dark/light mode pair generation
 */

// ─── Types ───────────────────────────────────────────────────

export type HarmonyType =
  | "complementary"
  | "split_complementary"
  | "triadic"
  | "analogous"
  | "monochromatic";

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface Palette {
  primary: string; // hex
  secondary: string;
  accent: string;
  neutralScale: string[]; // 50-950 (10 stops)
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// ─── Colour Psychology → Archetype Mapping ────────────────────

export const ARCHETYPE_COLOUR_MAP: Record<string, {
  hueRange: [number, number];
  saturation: "vibrant" | "moderate" | "muted";
  mood: string;
}> = {
  Hero: { hueRange: [0, 30], saturation: "vibrant", mood: "Bold reds, royal blues — strength, courage" },
  Creator: { hueRange: [160, 220], saturation: "vibrant", mood: "Teals, spectrum — imagination, innovation" },
  Explorer: { hueRange: [30, 60], saturation: "moderate", mood: "Earth tones, deep blues — adventure" },
  Sage: { hueRange: [210, 250], saturation: "muted", mood: "Deep navy, charcoal — wisdom, clarity" },
  Outlaw: { hueRange: [0, 360], saturation: "vibrant", mood: "Black, deep reds, acid greens — rebellion" },
  Magician: { hueRange: [260, 320], saturation: "vibrant", mood: "Purples, magentas, golds — transformation" },
  Everyman: { hueRange: [20, 220], saturation: "moderate", mood: "Warm neutrals, blues — belonging" },
  Lover: { hueRange: [330, 360], saturation: "moderate", mood: "Soft pinks, rich reds — intimacy" },
  Jester: { hueRange: [30, 60], saturation: "vibrant", mood: "Bright primaries, orange, yellow — joy" },
  Caregiver: { hueRange: [80, 160], saturation: "muted", mood: "Soft greens, warm creams — nurturing" },
  Ruler: { hueRange: [260, 300], saturation: "muted", mood: "Deep purples, golds — power, prestige" },
  Innocent: { hueRange: [180, 220], saturation: "muted", mood: "Pastels, clean whites, sky blues — purity" },
};

// ─── Hex ↔ HSL Conversion ────────────────────────────────────

export function hexToHsl(hex: string): HSL {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace("#", "");

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else {
    r = parseInt(clean.substring(0, 2), 16) / 255;
    g = parseInt(clean.substring(2, 4), 16) / 255;
    b = parseInt(clean.substring(4, 6), 16) / 255;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex({ h, s, l }: HSL): string {
  const sat = s / 100;
  const light = l / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Harmony Generation ──────────────────────────────────────

export function generateHarmony(baseHex: string, type: HarmonyType): string[] {
  const base = hexToHsl(baseHex);
  const colours: string[] = [baseHex];

  switch (type) {
    case "complementary":
      colours.push(hslToHex({ ...base, h: (base.h + 180) % 360 }));
      break;

    case "split_complementary": {
      const comp = (base.h + 180) % 360;
      colours.push(hslToHex({ ...base, h: (comp + 30) % 360 }));
      colours.push(hslToHex({ ...base, h: (comp - 30 + 360) % 360 }));
      break;
    }

    case "triadic":
      colours.push(hslToHex({ ...base, h: (base.h + 120) % 360 }));
      colours.push(hslToHex({ ...base, h: (base.h + 240) % 360 }));
      break;

    case "analogous":
      colours.push(hslToHex({ ...base, h: (base.h + 30) % 360 }));
      colours.push(hslToHex({ ...base, h: (base.h - 30 + 360) % 360 }));
      break;

    case "monochromatic": {
      const baseSat = base.s;
      colours.push(hslToHex({ ...base, l: Math.min(base.l + 20, 95), s: baseSat }));
      colours.push(hslToHex({ ...base, l: Math.max(base.l - 20, 5), s: baseSat }));
      colours.push(hslToHex({ ...base, l: Math.min(base.l + 40, 95), s: Math.max(baseSat - 20, 0) }));
      break;
    }
  }

  return colours;
}

// ─── Neutral Scale Generation (50-950) ──────────────────────

export function generateNeutralScale(baseHue: number = 220, baseSat: number = 5): string[] {
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightnessMap: Record<number, number> = {
    50: 97, 100: 95, 200: 90, 300: 82, 400: 70,
    500: 55, 600: 42, 700: 33, 800: 22, 900: 13, 950: 5,
  };

  return stops.map((stop) => {
    const sat = stop <= 200 ? 2 : stop <= 400 ? 3 : baseSat;
    return hslToHex({ h: baseHue, s: sat, l: lightnessMap[stop] });
  });
}

// ─── WCAG 2.1 AA Contrast Ratio ──────────────────────────────

export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function getContrastRatio(fg: string, bg: string): number {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(fg: string, bg: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(fg, bg);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// ─── 60-30-10 Distribution ───────────────────────────────────

export function apply60_30_10(
  primary: string,
  secondary: string,
  accent: string
): { dominant: string; supporting: string; highlight: string } {
  return {
    dominant: primary, // 60% — backgrounds, large surfaces
    supporting: secondary, // 30% — sections, cards, UI elements
    highlight: accent, // 10% — CTAs, links, interactive
  };
}

// ─── Dark Mode Pair Generation ───────────────────────────────

export function generateDarkModePair(lightHex: string): string {
  const hsl = hexToHsl(lightHex);

  // For very light colours (>70% lightness), invert and adjust
  if (hsl.l > 70) {
    return hslToHex({ ...hsl, l: Math.max(10, 100 - hsl.l), s: Math.min(hsl.s + 10, 80) });
  }

  // For dark colours, lighten
  if (hsl.l < 30) {
    return hslToHex({ ...hsl, l: Math.min(95, hsl.l + 60), s: Math.max(hsl.s - 10, 10) });
  }

  // For mid-tones, invert
  return hslToHex({ ...hsl, l: 100 - hsl.l });
}

// ─── Colour Suggestion from Emotional Territory ──────────────

const TERRITORY_COLOUR_MAP: Record<string, HSL> = {
  "confident clarity": { h: 210, s: 40, l: 45 },
  "rebellious energy": { h: 350, s: 85, l: 45 },
  "warm expertise": { h: 25, s: 50, l: 40 },
  "quiet power": { h: 260, s: 30, l: 25 },
  "fearless simplicity": { h: 200, s: 20, l: 30 },
  "joyful precision": { h: 45, s: 70, l: 55 },
};

export function suggestColourFromTerritory(territory: string): string {
  const match = TERRITORY_COLOUR_MAP[territory.toLowerCase()];
  if (match) return hslToHex(match);

  // Default: professional blue
  return "#2563EB";
}
