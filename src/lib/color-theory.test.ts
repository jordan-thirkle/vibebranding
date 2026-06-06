import {
  hexToHsl,
  hslToHex,
  getContrastRatio,
  meetsWCAGAA,
  generateHarmony,
  generateNeutralScale,
  generateDarkModePair,
  getRelativeLuminance,
  apply60_30_10,
  suggestColourFromTerritory,
} from "@/lib/color-theory";

describe("hexToHsl", () => {
  it("converts a 6-digit hex with #", () => {
    const result = hexToHsl("#ff0000");
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it("converts a 6-digit hex without #", () => {
    const result = hexToHsl("00ff00");
    expect(result.h).toBe(120);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it("converts a 3-digit shorthand hex", () => {
    const result = hexToHsl("#fff");
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(100);
  });

  it("handles black", () => {
    const result = hexToHsl("#000000");
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(0);
  });

  it("handles white", () => {
    const result = hexToHsl("#ffffff");
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(100);
  });

  it("handles a middle grey", () => {
    const result = hexToHsl("#808080");
    expect(result.h).toBe(0);
    expect(result.s).toBe(0);
    expect(result.l).toBe(50);
  });

  it("handles blue", () => {
    const result = hexToHsl("#0000ff");
    expect(result.h).toBe(240);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });
});

describe("hslToHex", () => {
  it("converts HSL back to hex", () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#ff0000");
  });

  it("handles green", () => {
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe("#00ff00");
  });

  it("handles blue", () => {
    expect(hslToHex({ h: 240, s: 100, l: 50 })).toBe("#0000ff");
  });

  it("handles white", () => {
    expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe("#ffffff");
  });

  it("handles black", () => {
    expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe("#000000");
  });

  it("round-trips with hexToHsl (within precision)", () => {
    const hexes = ["#ff6600", "#336699", "#cc3366", "#ffee00", "#aabbcc"];
    for (const hex of hexes) {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl);
      const back = hexToHsl(result);
      expect(Math.abs(back.h - hsl.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.s - hsl.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.l - hsl.l)).toBeLessThanOrEqual(1);
    }
  });

  it("handles low saturation", () => {
    const result = hslToHex({ h: 200, s: 0, l: 50 });
    expect(result).toBe("#808080");
  });
});

describe("getContrastRatio", () => {
  it("returns 1:1 for identical colours", () => {
    expect(getContrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(getContrastRatio("#000000", "#000000")).toBe(1);
    expect(getContrastRatio("#ff0000", "#ff0000")).toBe(1);
  });

  it("returns ~21:1 for black on white", () => {
    const ratio = getContrastRatio("#000000", "#ffffff");
    expect(ratio).toBeGreaterThanOrEqual(20);
    expect(ratio).toBeLessThanOrEqual(22);
  });

  it("returns ~21:1 for white on black", () => {
    const ratio = getContrastRatio("#ffffff", "#000000");
    expect(ratio).toBeGreaterThanOrEqual(20);
    expect(ratio).toBeLessThanOrEqual(22);
  });

  it("meets WCAG AA (4.5:1) for black text on white bg", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeGreaterThan(4.5);
  });

  it("meets WCAG AA large text (3:1) for grey on white", () => {
    const ratio = getContrastRatio("#767676", "#ffffff");
    expect(ratio).toBeGreaterThan(3);
  });

  it("fails WCAG AA for light grey on white", () => {
    const ratio = getContrastRatio("#cccccc", "#ffffff");
    expect(ratio).toBeLessThan(4.5);
  });

  it("is commutative", () => {
    const fg = "#333333";
    const bg = "#eeeeee";
    expect(getContrastRatio(fg, bg)).toBe(getContrastRatio(bg, fg));
  });
});

describe("meetsWCAGAA", () => {
  it("passes for black on white (normal text)", () => {
    expect(meetsWCAGAA("#000000", "#ffffff")).toBe(true);
  });

  it("passes for black on white (large text)", () => {
    expect(meetsWCAGAA("#000000", "#ffffff", true)).toBe(true);
  });

  it("passes for dark grey on white (large text)", () => {
    expect(meetsWCAGAA("#767676", "#ffffff", true)).toBe(true);
  });

  it("fails for light grey on white (normal text)", () => {
    expect(meetsWCAGAA("#cccccc", "#ffffff")).toBe(false);
  });
});

describe("generateHarmony", () => {
  const base = "#ff6600";

  it("generates complementary harmony (2 colours)", () => {
    const result = generateHarmony(base, "complementary");
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(base);
    const hsl1 = hexToHsl(result[1]);
    expect(hsl1.h).toBe((hexToHsl(base).h + 180) % 360);
  });

  it("generates split-complementary harmony (3 colours)", () => {
    const result = generateHarmony(base, "split_complementary");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(base);
  });

  it("generates triadic harmony (3 colours)", () => {
    const result = generateHarmony(base, "triadic");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(base);
  });

  it("generates analogous harmony (3 colours)", () => {
    const result = generateHarmony(base, "analogous");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe(base);
  });

  it("generates monochromatic harmony (4 colours)", () => {
    const result = generateHarmony(base, "monochromatic");
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(base);
  });

  it("all generated colours are valid hex strings", () => {
    const types = ["complementary", "split_complementary", "triadic", "analogous", "monochromatic"] as const;
    for (const type of types) {
      const result = generateHarmony(base, type);
      for (const colour of result) {
        expect(colour).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("different bases produce different harmonies", () => {
    const a = generateHarmony("#ff0000", "complementary");
    const b = generateHarmony("#00ff00", "complementary");
    expect(a[1]).not.toBe(b[1]);
  });
});

describe("generateNeutralScale", () => {
  it("returns 11 stops", () => {
    const scale = generateNeutralScale();
    expect(scale).toHaveLength(11);
  });

  it("stops are valid hex colours", () => {
    const scale = generateNeutralScale();
    for (const stop of scale) {
      expect(stop).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("stops progress from light to dark", () => {
    const scale = generateNeutralScale();
    const lightness = scale.map((c) => hexToHsl(c).l);
    for (let i = 1; i < lightness.length; i++) {
      expect(lightness[i]).toBeLessThan(lightness[i - 1]);
    }
  });

  it("accepts custom base hue and saturation", () => {
    const scale = generateNeutralScale(30, 10);
    expect(scale).toHaveLength(11);
  });

  it("stops have valid saturation values", () => {
    const scale = generateNeutralScale(220, 5);
    for (const c of scale) {
      const hsl = hexToHsl(c);
      expect(hsl.s).toBeGreaterThanOrEqual(0);
      expect(hsl.s).toBeLessThanOrEqual(100);
    }
  });
});

describe("generateDarkModePair", () => {
  it("inverts a mid-tone colour", () => {
    const light = "#808080";
    const dark = generateDarkModePair(light);
    const lightL = hexToHsl(light).l;
    const darkL = hexToHsl(dark).l;
    expect(darkL).toBe(100 - lightL);
  });

  it("darkens a very light colour", () => {
    const light = "#f0f0f0";
    const dark = generateDarkModePair(light);
    const darkL = hexToHsl(dark).l;
    expect(darkL).toBeLessThan(50);
  });

  it("lightens a very dark colour", () => {
    const dark = "#111111";
    const pair = generateDarkModePair(dark);
    const darkL = hexToHsl(dark).l;
    const pairL = hexToHsl(pair).l;
    expect(pairL).toBeGreaterThan(darkL + 40);
  });

  it("returns a valid hex", () => {
    expect(generateDarkModePair("#ff6600")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("dark mode pair is visually different", () => {
    const pair = generateDarkModePair("#4488cc");
    expect(pair).not.toBe("#4488cc");
  });
});

describe("apply60_30_10", () => {
  it("returns the three colours in order", () => {
    const result = apply60_30_10("#111", "#222", "#333");
    expect(result.dominant).toBe("#111");
    expect(result.supporting).toBe("#222");
    expect(result.highlight).toBe("#333");
  });
});

describe("suggestColourFromTerritory", () => {
  it("returns a known territory colour", () => {
    const colour = suggestColourFromTerritory("rebellious energy");
    expect(colour).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns default for unknown territory", () => {
    expect(suggestColourFromTerritory("unknown")).toBe("#2563EB");
  });

  it("is case-insensitive", () => {
    expect(suggestColourFromTerritory("Confident Clarity")).toBe(suggestColourFromTerritory("confident clarity"));
  });
});

describe("getRelativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(getRelativeLuminance("#000000")).toBe(0);
  });

  it("returns ~1 for white", () => {
    expect(getRelativeLuminance("#ffffff")).toBeCloseTo(1, 1);
  });
});
