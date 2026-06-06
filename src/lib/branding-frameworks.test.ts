import {
  ARCHETYPES,
  getSpectrumFromArchetypes,
  getToneFromArchetypes,
  buildPositioningStatement,
} from "@/lib/branding-frameworks";

describe("ARCHETYPES", () => {
  const requiredFields: Array<keyof (typeof ARCHETYPES)[string]> = [
    "name",
    "motto",
    "desire",
    "goal",
    "fear",
    "strategy",
    "visualCues",
    "verbalCues",
    "colourMood",
    "shapeLanguage",
    "examples",
  ];

  it("contains all 12 archetypes", () => {
    const names = Object.keys(ARCHETYPES);
    expect(names).toHaveLength(12);
    expect(names).toEqual(
      expect.arrayContaining([
        "Hero", "Creator", "Explorer", "Sage", "Outlaw", "Magician",
        "Everyman", "Lover", "Jester", "Caregiver", "Ruler", "Innocent",
      ])
    );
  });

  it("each archetype has all required fields", () => {
    for (const [key, archetype] of Object.entries(ARCHETYPES)) {
      for (const field of requiredFields) {
        expect(archetype[field]).toBeDefined();
        expect(typeof archetype[field]).not.toBe("undefined");
      }
    }
  });

  it("each archetype has a non-empty motto", () => {
    for (const archetype of Object.values(ARCHETYPES)) {
      expect(archetype.motto.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has non-empty array of examples", () => {
    for (const archetype of Object.values(ARCHETYPES)) {
      expect(archetype.examples.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has unique colour mood", () => {
    const moods = Object.values(ARCHETYPES).map((a) => a.colourMood);
    expect(new Set(moods).size).toBe(12);
  });

  it("each archetype has a non-empty shape language", () => {
    for (const archetype of Object.values(ARCHETYPES)) {
      expect(archetype.shapeLanguage.length).toBeGreaterThan(0);
    }
  });

  it("Hero archetype has expected values", () => {
    const hero = ARCHETYPES.Hero;
    expect(hero.name).toBe("Hero");
    expect(hero.motto).toContain("will");
    expect(hero.examples).toContain("Nike");
    expect(hero.colourMood).toContain("reds");
    expect(hero.shapeLanguage).toContain("Triangle");
  });

  it("Jester archetype has playful verbal cues", () => {
    const jester = ARCHETYPES.Jester;
    expect(jester.verbalCues).toContain("Witty");
    expect(jester.colourMood).toContain("orange");
  });

  it("Sage archetype is knowledge-oriented", () => {
    const sage = ARCHETYPES.Sage;
    expect(sage.desire).toContain("truth");
    expect(sage.goal).toContain("wisdom");
  });

  it("Outlaw archetype is disruptive", () => {
    const outlaw = ARCHETYPES.Outlaw;
    expect(outlaw.strategy).toContain("Disrupt");
    expect(outlaw.colourMood).toContain("Black");
  });
});

describe("getSpectrumFromArchetypes", () => {
  it("returns all 5 axes with numbers", () => {
    const hero = ARCHETYPES.Hero;
    const spectrum = getSpectrumFromArchetypes([hero]);
    expect(spectrum).toHaveProperty("excitingVsCalm");
    expect(spectrum).toHaveProperty("modernVsClassic");
    expect(spectrum).toHaveProperty("playfulVsSerious");
    expect(spectrum).toHaveProperty("accessibleVsExclusive");
    expect(spectrum).toHaveProperty("boldVsUnderstated");
  });

  it("Hero archetype scores high on exciting and bold", () => {
    const hero = ARCHETYPES.Hero;
    const spectrum = getSpectrumFromArchetypes([hero]);
    expect(spectrum.excitingVsCalm).toBeGreaterThan(50);
    expect(spectrum.boldVsUnderstated).toBeGreaterThan(50);
  });

  it("Sage archetype scores low on playful", () => {
    const sage = ARCHETYPES.Sage;
    const spectrum = getSpectrumFromArchetypes([sage]);
    expect(spectrum.playfulVsSerious).toBeLessThan(50);
  });

  it("Everyman archetype scores high on accessible", () => {
    const everyman = ARCHETYPES.Everyman;
    const spectrum = getSpectrumFromArchetypes([everyman]);
    expect(spectrum.accessibleVsExclusive).toBeGreaterThan(50);
  });

  it("Jester archetype scores high on playful and exciting", () => {
    const jester = ARCHETYPES.Jester;
    const spectrum = getSpectrumFromArchetypes([jester]);
    expect(spectrum.playfulVsSerious).toBeGreaterThan(80);
    expect(spectrum.excitingVsCalm).toBeGreaterThan(80);
  });

  it("returns neutral values for empty archetypes array", () => {
    const spectrum = getSpectrumFromArchetypes([]);
    expect(spectrum.excitingVsCalm).toBe(50);
    expect(spectrum.modernVsClassic).toBe(50);
    expect(spectrum.playfulVsSerious).toBe(50);
    expect(spectrum.accessibleVsExclusive).toBe(50);
    expect(spectrum.boldVsUnderstated).toBe(50);
  });

  it("averages values for multiple archetypes", () => {
    const hero = ARCHETYPES.Hero;
    const caregiver = ARCHETYPES.Caregiver;
    const spectrum = getSpectrumFromArchetypes([hero, caregiver]);
    expect(spectrum.excitingVsCalm).toBeGreaterThanOrEqual(1);
    expect(spectrum.excitingVsCalm).toBeLessThanOrEqual(100);
  });

  it("all values are between 0 and 100", () => {
    const allArchetypes = Object.values(ARCHETYPES);
    const spectrum = getSpectrumFromArchetypes(allArchetypes);
    const values = Object.values(spectrum);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});

describe("getToneFromArchetypes", () => {
  it("returns all 4 tone dimensions", () => {
    const hero = ARCHETYPES.Hero;
    const tone = getToneFromArchetypes([hero]);
    expect(tone).toHaveProperty("formalToCasual");
    expect(tone).toHaveProperty("seriousToWitty");
    expect(tone).toHaveProperty("authoritativeToApproachable");
    expect(tone).toHaveProperty("conventionalToIrreverent");
  });

  it("Jester archetype scores high on casual and witty", () => {
    const jester = ARCHETYPES.Jester;
    const tone = getToneFromArchetypes([jester]);
    expect(tone.formalToCasual).toBeGreaterThan(80);
    expect(tone.seriousToWitty).toBeGreaterThan(80);
    expect(tone.conventionalToIrreverent).toBeGreaterThan(80);
  });

  it("Sage archetype scores low on casual and high on authoritative", () => {
    const sage = ARCHETYPES.Sage;
    const tone = getToneFromArchetypes([sage]);
    expect(tone.formalToCasual).toBeLessThan(50);
    expect(tone.authoritativeToApproachable).toBeLessThan(50);
  });

  it("Ruler archetype is very formal and serious", () => {
    const ruler = ARCHETYPES.Ruler;
    const tone = getToneFromArchetypes([ruler]);
    expect(tone.formalToCasual).toBeLessThan(30);
    expect(tone.seriousToWitty).toBeLessThan(30);
  });

  it("Everyman archetype is approachable", () => {
    const everyman = ARCHETYPES.Everyman;
    const tone = getToneFromArchetypes([everyman]);
    expect(tone.authoritativeToApproachable).toBeGreaterThan(70);
  });

  it("all values are between 0 and 100", () => {
    const allArchetypes = Object.values(ARCHETYPES);
    const tone = getToneFromArchetypes(allArchetypes);
    const values = Object.values(tone);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("returns NaN for empty array (no early return in implementation)", () => {
    const tone = getToneFromArchetypes([]);
    expect(Number.isNaN(tone.formalToCasual)).toBe(true);
    expect(Number.isNaN(tone.seriousToWitty)).toBe(true);
    expect(Number.isNaN(tone.authoritativeToApproachable)).toBe(true);
    expect(Number.isNaN(tone.conventionalToIrreverent)).toBe(true);
  });
});

describe("buildPositioningStatement", () => {
  it("builds a complete positioning statement", () => {
    const statement = buildPositioningStatement(
      "startups",
      "need fast prototyping",
      "VibeBranding",
      "brand identity platform",
      "generates complete brand systems from a single prompt",
      "Canva",
      "requires manual design work",
    );
    expect(statement).toContain("startups");
    expect(statement).toContain("VibeBranding");
    expect(statement).toContain("Canva");
    expect(statement).toMatch(/^For .+ unlike .+\.$/);
  });

  it("follows the expected sentence structure", () => {
    const statement = buildPositioningStatement("A", "B", "C", "D", "E", "F", "G");
    expect(statement).toBe("For A who B, C is the D that E, unlike F which G.");
  });
});
