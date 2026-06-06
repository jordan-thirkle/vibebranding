import {
  generateTypeScale,
  recommendFonts,
  calculateMaxLineLength,
  generateTypeScaleCSS,
  buildFallbackStack,
  FONT_RECOMMENDATIONS,
} from "@/lib/typography";

describe("generateTypeScale", () => {
  it("returns the correct structure", () => {
    const scale = generateTypeScale();
    expect(scale).toHaveProperty("ratio");
    expect(scale).toHaveProperty("ratioName");
    expect(scale).toHaveProperty("baseSizePx", 16);
    expect(scale).toHaveProperty("steps");
    expect(scale.steps).toHaveLength(9);
  });

  it("produces increasing sizes for major_third", () => {
    const scale = generateTypeScale(16, "major_third");
    const sizes = scale.steps.map((s) => s.sizePx);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it("produces increasing sizes for minor_third", () => {
    const scale = generateTypeScale(16, "minor_third");
    const sizes = scale.steps.map((s) => s.sizePx);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it("produces increasing sizes for perfect_fourth", () => {
    const scale = generateTypeScale(16, "perfect_fourth");
    const sizes = scale.steps.map((s) => s.sizePx);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it("produces increasing sizes for augmented_fourth", () => {
    const scale = generateTypeScale(16, "augmented_fourth");
    const sizes = scale.steps.map((s) => s.sizePx);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it("perfect_fourth grows faster than major_third", () => {
    const majorThird = generateTypeScale(16, "major_third");
    const perfectFourth = generateTypeScale(16, "perfect_fourth");
    const lastMajor = majorThird.steps[majorThird.steps.length - 1].sizePx;
    const lastPerfect = perfectFourth.steps[perfectFourth.steps.length - 1].sizePx;
    expect(lastPerfect).toBeGreaterThan(lastMajor);
  });

  it("augmented_fourth grows faster than perfect_fourth", () => {
    const pf = generateTypeScale(16, "perfect_fourth");
    const af = generateTypeScale(16, "augmented_fourth");
    expect(af.ratio).toBeGreaterThan(pf.ratio);
  });

  it("returns correct ratio values", () => {
    expect(generateTypeScale(16, "major_third").ratio).toBe(1.25);
    expect(generateTypeScale(16, "minor_third").ratio).toBe(1.2);
    expect(generateTypeScale(16, "perfect_fourth").ratio).toBe(1.333);
    expect(generateTypeScale(16, "augmented_fourth").ratio).toBe(1.414);
  });

  it("step names are in order", () => {
    const expected = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "display"];
    const scale = generateTypeScale();
    expect(scale.steps.map((s) => s.name)).toEqual(expected);
  });

  it("each step has a usage description", () => {
    const scale = generateTypeScale();
    for (const step of scale.steps) {
      expect(step.usage).toBeTruthy();
    }
  });

  it("line height decreases for larger sizes", () => {
    const scale = generateTypeScale(16, "major_third");
    const smallSteps = scale.steps.filter((s) => s.sizePx <= 20);
    const largeSteps = scale.steps.filter((s) => s.sizePx > 48);
    for (const s of smallSteps) {
      expect(s.lineHeight).toBeGreaterThanOrEqual(1.4);
    }
    for (const s of largeSteps) {
      expect(s.lineHeight).toBeLessThanOrEqual(1.2);
    }
  });

  it("base step size matches basePx argument", () => {
    const scale = generateTypeScale(18, "major_third");
    const base = scale.steps.find((s) => s.name === "base")!;
    expect(base.sizePx).toBe(18);
  });
});

describe("recommendFonts", () => {
  it("returns display and text recommendations", () => {
    const result = recommendFonts(["Hero"], 60);
    expect(result).toHaveProperty("display");
    expect(result).toHaveProperty("text");
    expect(Array.isArray(result.display)).toBe(true);
    expect(Array.isArray(result.text)).toBe(true);
  });

  it("returns at least 2 recommendations per category", () => {
    const result = recommendFonts(["Hero"], 60);
    expect(result.display.length).toBeGreaterThanOrEqual(2);
    expect(result.text.length).toBeGreaterThanOrEqual(2);
  });

  it("returns at most 5 per category", () => {
    const result = recommendFonts(["Hero"], 60);
    expect(result.display.length).toBeLessThanOrEqual(5);
    expect(result.text.length).toBeLessThanOrEqual(5);
  });

  it("gives more display fonts for playful modern brands", () => {
    const result = recommendFonts(["Jester", "Creator"], 80);
    const displayClassifications = result.display.map((f) => f.classification);
    expect(displayClassifications).toContain("geometric_sans");
    expect(displayClassifications).toContain("display_variable");
  });

  it("gives serif options for authoritative brands", () => {
    const result = recommendFonts(["Sage", "Ruler"], 30);
    const displayClassifications = result.display.map((f) => f.classification);
    expect(displayClassifications).toContain("transitional_serif");
  });

  it("returns recommendations with correct shape", () => {
    const result = recommendFonts(["Hero"], 50);
    for (const font of result.display) {
      expect(font).toHaveProperty("name");
      expect(font).toHaveProperty("classification");
      expect(font).toHaveProperty("source");
      expect(font).toHaveProperty("weights");
      expect(font).toHaveProperty("bestFor");
    }
  });

  it("handles empty archetypes list gracefully", () => {
    const result = recommendFonts([], 50);
    expect(result.display.length).toBeGreaterThanOrEqual(1);
    expect(result.text.length).toBeGreaterThanOrEqual(1);
  });

  it("handles modernVsClassic boundary values", () => {
    const modern = recommendFonts(["Creator"], 100);
    const classic = recommendFonts(["Creator"], 0);
    expect(modern.display).toBeDefined();
    expect(classic.display).toBeDefined();
  });
});

describe("FONT_RECOMMENDATIONS", () => {
  it("contains fonts across multiple classifications", () => {
    const classifications = new Set(FONT_RECOMMENDATIONS.map((f) => f.classification));
    expect(classifications.has("geometric_sans")).toBe(true);
    expect(classifications.has("humanist_sans")).toBe(true);
    expect(classifications.has("transitional_serif")).toBe(true);
    expect(classifications.has("display_variable")).toBe(true);
    expect(classifications.has("mono")).toBe(true);
  });

  it("each font has a name, classification, source, weights", () => {
    for (const font of FONT_RECOMMENDATIONS) {
      expect(typeof font.name).toBe("string");
      expect(font.name.length).toBeGreaterThan(0);
      expect(font.weights.length).toBeGreaterThan(0);
      expect(["google", "adobe", "system"]).toContain(font.source);
    }
  });

  it("JetBrains Mono is the only mono font", () => {
    const mono = FONT_RECOMMENDATIONS.filter((f) => f.classification === "mono");
    expect(mono).toHaveLength(1);
    expect(mono[0].name).toBe("JetBrains Mono");
  });
});

describe("calculateMaxLineLength", () => {
  it("returns a rem string", () => {
    expect(calculateMaxLineLength(16)).toMatch(/^\d+\.\d+rem$/);
  });

  it("increases with larger font sizes", () => {
    const small = calculateMaxLineLength(12);
    const large = calculateMaxLineLength(24);
    const smallVal = parseFloat(small);
    const largeVal = parseFloat(large);
    expect(largeVal).toBeGreaterThan(smallVal);
  });

  it("accepts custom characters per line", () => {
    const defaultLen = calculateMaxLineLength(16);
    const shortLen = calculateMaxLineLength(16, 50);
    expect(parseFloat(shortLen)).toBeLessThan(parseFloat(defaultLen));
  });
});

describe("generateTypeScaleCSS", () => {
  it("returns CSS variable declarations", () => {
    const scale = generateTypeScale();
    const css = generateTypeScaleCSS(scale);
    expect(css).toContain("--type-scale-base");
    expect(css).toContain("--type-scale-xs");
    expect(css).toContain("--type-scale-display");
    expect(css).toContain(":root");
  });

  it("includes line-height variables", () => {
    const scale = generateTypeScale();
    const css = generateTypeScaleCSS(scale);
    expect(css).toContain("--type-scale-base-line-height");
  });
});

describe("buildFallbackStack", () => {
  it("includes the font name", () => {
    const stack = buildFallbackStack(FONT_RECOMMENDATIONS[0]);
    expect(stack).toContain(FONT_RECOMMENDATIONS[0].name);
  });

  it("adds serif fallback for serif fonts", () => {
    const serifFont = FONT_RECOMMENDATIONS.find((f) => f.classification === "transitional_serif")!;
    const stack = buildFallbackStack(serifFont);
    expect(stack).toContain("serif");
  });

  it("adds monospace fallback for mono fonts", () => {
    const monoFont = FONT_RECOMMENDATIONS.find((f) => f.classification === "mono")!;
    const stack = buildFallbackStack(monoFont);
    expect(stack).toContain("monospace");
  });
});
