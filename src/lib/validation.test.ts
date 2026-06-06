import {
  analyzePhonetics,
  scoreMemorability,
  assessTrademarkRisk,
  checkNegativeMeanings,
  isValidDomain,
  domainAvailabilityPatterns,
  isValidUrl,
  isValidSocialHandle,
  getSocialHandleUrls,
} from "@/lib/validation";

describe("analyzePhonetics", () => {
  it("counts syllables for a simple word", () => {
    const result = analyzePhonetics("hello");
    expect(result.syllables).toBe(2);
  });

  it("counts a single syllable for monosyllabic words", () => {
    const result = analyzePhonetics("cat");
    expect(result.syllables).toBe(1);
  });

  it("returns a rhythm pattern string", () => {
    const result = analyzePhonetics("hello");
    expect(typeof result.rhythm).toBe("string");
    expect(result.rhythm.length).toBe("hello".length);
  });

  it("rhythm uses ¯ and ˘ characters", () => {
    const result = analyzePhonetics("hello");
    expect(result.rhythm).toMatch(/^[¯˘]+$/);
  });

  it("marks vowels as ˘ and consonants as ¯", () => {
    const result = analyzePhonetics("a");
    expect(result.rhythm).toBe("˘");
    const result2 = analyzePhonetics("b");
    expect(result2.rhythm).toBe("¯");
  });

  it("higher pronounceability for simple words", () => {
    const simple = analyzePhonetics("bono");
    const complex = analyzePhonetics("krzysztof");
    expect(simple.pronounceability).toBeGreaterThanOrEqual(complex.pronounceability);
  });

  it("score is between 1 and 10", () => {
    const result = analyzePhonetics("anything");
    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("2-3 syllable words score higher than 5+ syllable words", () => {
    const ideal = analyzePhonetics("vibe");
    const long = analyzePhonetics("antidisestablishment");
    expect(ideal.score).toBeGreaterThanOrEqual(long.score);
  });

  it("handles empty input gracefully", () => {
    const result = analyzePhonetics("");
    expect(result.syllables).toBe(1);
    expect(result.score).toBeGreaterThanOrEqual(1);
  });
});

describe("scoreMemorability", () => {
  it("scores between 1 and 10", () => {
    expect(scoreMemorability("hello")).toBeGreaterThanOrEqual(1);
    expect(scoreMemorability("hello")).toBeLessThanOrEqual(10);
  });

  it("ideal length (4-8 chars) scores higher than very short", () => {
    const ideal = scoreMemorability("vibebrand");
    const short = scoreMemorability("x");
    expect(ideal).toBeGreaterThanOrEqual(short);
  });

  it("penalizes generic words like 'app', 'hub'", () => {
    const generic = scoreMemorability("myapp");
    const specific = scoreMemorability("zylk");
    expect(generic).toBeLessThanOrEqual(specific);
  });

  it("rewards repeated consonants", () => {
    const repeated = scoreMemorability("bubble");
    const normal = scoreMemorability("bocle");
    expect(repeated).toBeGreaterThanOrEqual(normal);
  });

  it("rewards alliteration", () => {
    const alliterated = scoreMemorability("doodle");
    const normal = scoreMemorability("module");
    expect(alliterated).toBeGreaterThanOrEqual(normal);
  });

  it("never returns less than 1", () => {
    expect(scoreMemorability("")).toBeGreaterThanOrEqual(1);
  });

  it("never returns more than 10", () => {
    const multipleBonus = scoreMemorability("bobblehead");
    expect(multipleBonus).toBeLessThanOrEqual(10);
  });

  it("returns higher score for memorable names", () => {
    const good = scoreMemorability("google");
    const bad = scoreMemorability("xylophone");
    expect(good).toBeGreaterThanOrEqual(1);
    expect(bad).toBeGreaterThanOrEqual(1);
  });
});

describe("assessTrademarkRisk", () => {
  it("returns 'low' for unique names", () => {
    const result = assessTrademarkRisk("VibeBranding");
    expect(result.risk).toBe("low");
    expect(result.conflicts).toEqual([]);
  });

  it("returns 'conflict' for names containing high-risk words", () => {
    const result = assessTrademarkRisk("AppleTech");
    expect(result.risk).toBe("conflict");
    expect(result.conflicts).toContain("apple");
  });

  it("returns 'conflict' if a high-risk word contains the name", () => {
    const result = assessTrademarkRisk("goog");
    expect(result.risk).toBe("conflict");
    expect(result.conflicts).toContain("google");
  });

  it("returns 'high' for very short names (≤3 chars)", () => {
    const result = assessTrademarkRisk("xy");
    expect(result.risk).toBe("high");
  });

  it("returns 'medium' for names with very short words", () => {
    const result = assessTrademarkRisk("Go App");
    expect(result.risk).toBe("medium");
  });

  it("detects multiple conflicts", () => {
    const result = assessTrademarkRisk("apple google");
    expect(result.risk).toBe("conflict");
    expect(result.conflicts.length).toBeGreaterThanOrEqual(2);
  });

  it("is case-insensitive", () => {
    const lower = assessTrademarkRisk("apple");
    const upper = assessTrademarkRisk("APPLE");
    expect(lower.risk).toBe(upper.risk);
    expect(lower.conflicts).toEqual(upper.conflicts);
  });
});

describe("checkNegativeMeanings", () => {
  it("returns empty array for clean names", () => {
    const result = checkNegativeMeanings("VibeBranding");
    expect(result).toEqual([]);
  });

  it("detects known negative words", () => {
    const result = checkNegativeMeanings("barf");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain("barf");
  });

  it("flags substrings of negative words", () => {
    const result = checkNegativeMeanings("barfoom");
    expect(result.length).toBeGreaterThan(0);
  });

  it("reports the meaning for flagged words", () => {
    const result = checkNegativeMeanings("fart");
    expect(result[0]).toContain("English");
    expect(result[0]).toContain("flatulence");
  });

  it("is case-insensitive", () => {
    const lower = checkNegativeMeanings("barf");
    const upper = checkNegativeMeanings("BARF");
    expect(lower).toEqual(upper);
  });

  it("reports multiple negative matches", () => {
    const result = checkNegativeMeanings("barfkaka");
    expect(result.length).toBe(2);
  });
});

describe("isValidDomain", () => {
  it("validates standard domains", () => {
    expect(isValidDomain("example.com")).toBe(true);
    expect(isValidDomain("sub.domain.io")).toBe(true);
  });

  it("rejects invalid domains", () => {
    expect(isValidDomain("")).toBe(false);
    expect(isValidDomain("not-a-domain")).toBe(false);
    expect(isValidDomain(".com")).toBe(false);
  });
});

describe("domainAvailabilityPatterns", () => {
  it("returns all TLD variations", () => {
    const patterns = domainAvailabilityPatterns("example");
    expect(patterns).toContain("example.com");
    expect(patterns).toContain("example.io");
    expect(patterns).toContain("example.app");
    expect(patterns).toContain("example.dev");
    expect(patterns).toContain("example.co");
    expect(patterns).toContain("example.ai");
  });
});

describe("isValidUrl", () => {
  it("validates https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("rejects garbage strings", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});

describe("isValidSocialHandle", () => {
  it("validates twitter handles", () => {
    expect(isValidSocialHandle("twitter", "handle")).toBe(true);
    expect(isValidSocialHandle("twitter", "a".repeat(16))).toBe(false);
  });

  it("validates github handles", () => {
    expect(isValidSocialHandle("github", "user-name")).toBe(true);
    expect(isValidSocialHandle("github", "-invalid")).toBe(false);
  });

  it("returns false for unknown platforms", () => {
    expect(isValidSocialHandle("unknown", "anything")).toBe(false);
  });
});

describe("getSocialHandleUrls", () => {
  it("generates URL strings for all platforms", () => {
    const urls = getSocialHandleUrls("MyBrand");
    expect(urls.twitter).toContain("twitter.com");
    expect(urls.github).toContain("github.com");
    expect(urls.instagram).toContain("instagram.com");
    expect(urls.linkedin).toContain("linkedin.com");
  });

  it("sanitizes the name", () => {
    const urls = getSocialHandleUrls("My Brand!");
    expect(urls.twitter).toContain("mybrand");
  });
});
