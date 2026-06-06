import { describe, it, expect, beforeEach } from "vitest";
import { PromptEngine, getPromptEngine } from "./index";
import { registerAllTemplates } from "./templates";
import type { BrandStateObject } from "@/core/bso/types";

function createMinimalBso(): BrandStateObject {
  return {
    version: "1.0.0",
    product: {
      name: "VibeCheck",
      tagline: "Your brand, validated",
      description: "An AI brand identity generator",
      category: "SaaS",
      audience: {
        demographics: "Indie developers and startup founders",
        psychographics: "Creative, tech-savvy, value-driven",
        techSophistication: "high",
      },
      competitors: [
        { name: "Brandmark", notes: "AI logo generator" },
        { name: "Looka", notes: "Brand identity platform" },
      ],
    },
    strategy: {
      positioning: "The brand identity platform for vibe-coded products",
      personalityArchetypes: [
        { archetype: "Creator", weight: 60, rationale: "Innovation-driven" },
        { archetype: "Magician", weight: 40, rationale: "Transformative experience" },
      ],
      personalitySpectrum: {
        excitingVsCalm: 70,
        modernVsClassic: 80,
        playfulVsSerious: 60,
        accessibleVsExclusive: 70,
        boldVsUnderstated: 65,
      },
      brandValues: ["Creativity", "Clarity", "Authenticity"],
      toneOfVoice: {
        formalToCasual: 70,
        seriousToWitty: 65,
        authoritativeToApproachable: 75,
        conventionalToIrreverent: 60,
      },
      emotionalTerritory: "confident creativity",
    },
    visualIdentity: {},
    verbalIdentity: {},
    assets: {
      generated: [],
      exportFormats: [],
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stage: 1,
      history: [],
    },
  };
}

describe("PromptEngine", () => {
  let engine: PromptEngine;

  beforeEach(() => {
    engine = new PromptEngine();
  });

  describe("initialization", () => {
    it("initializes with empty templates", () => {
      expect(() => engine.build("discovery", createMinimalBso())).toThrow(
        /No prompt template registered for module: discovery/
      );
    });
  });

  describe("register", () => {
    it("registers a template and builds a prompt from it", () => {
      engine.register("test", () => "Hello from test");
      const result = engine.build("test", createMinimalBso());
      expect(result).toContain("Hello from test");
    });

    it("overwrites an existing template", () => {
      engine.register("test", () => "First");
      engine.register("test", () => "Second");
      const result = engine.build("test", createMinimalBso());
      expect(result).toContain("Second");
    });
  });

  describe("build", () => {
    it("prepends stage context to prompt output", () => {
      engine.register("test", () => "Prompt body");
      const result = engine.build("test", createMinimalBso());
      expect(result).toContain("Current Brand State");
      expect(result).toContain("Prompt body");
    });

    it("includes product info in stage context", () => {
      engine.register("test", () => "Body");
      const result = engine.build("test", createMinimalBso());
      expect(result).toContain("VibeCheck");
      expect(result).toContain("SaaS");
    });

    it("throws for unknown template", () => {
      expect(() =>
        engine.build("nonexistent", createMinimalBso())
      ).toThrow(/No prompt template registered for module: nonexistent/);
    });
  });

  describe("registerAllTemplates", () => {
    it("registers all templates without error", () => {
      expect(() => registerAllTemplates(engine)).not.toThrow();
    });

    it("registers the expected number of templates", () => {
      registerAllTemplates(engine);
      const modules = [
        "discovery",
        "strategy",
        "naming",
        "color",
        "typography",
        "logo",
        "iconography",
        "illustration",
        "motion",
        "copywriting",
      ];
      for (const mod of modules) {
        expect(() => engine.build(mod, createMinimalBso())).not.toThrow();
      }
    });

    it("each registered template produces a non-empty string", () => {
      registerAllTemplates(engine);
      const modules = [
        "discovery",
        "strategy",
        "naming",
        "color",
        "typography",
        "logo",
        "iconography",
        "illustration",
        "motion",
      ];
      for (const mod of modules) {
        const result = engine.build(mod, createMinimalBso());
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe("buildValidationPrompt", () => {
    it("returns a validation prompt string", () => {
      const bso = createMinimalBso();
      const result = engine.buildValidationPrompt(bso);
      expect(result).toContain("VALIDATION GATE");
      expect(result).toContain("Stage 1");
    });

    it("reflects the current stage", () => {
      const bso = createMinimalBso();
      bso.metadata.stage = 4;
      const result = engine.buildValidationPrompt(bso);
      expect(result).toContain("Stage 4");
    });
  });

  describe("getPromptEngine", () => {
    it("returns a singleton instance", () => {
      const a = getPromptEngine();
      const b = getPromptEngine();
      expect(a).toBe(b);
    });
  });
});
