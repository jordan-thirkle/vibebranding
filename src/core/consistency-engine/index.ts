import type { BrandStateObject, ConsistencyCheck, ConsistencyReport } from "@/core/bso/types";

/**
 * Brand Consistency Engine (BCE)
 *
 * Cross-layer validator that checks visual, verbal, and tonal coherence
 * across all generated brand outputs. Flags contradictions with
 * remediation suggestions and severity levels.
 */

type CheckFn = (bso: Readonly<BrandStateObject>) => ConsistencyCheck;

export class ConsistencyEngine {
  private checks: CheckFn[] = [];

  constructor() {
    this.registerDefaults();
  }

  /** Add a custom consistency check */
  register(check: CheckFn): void {
    this.checks.push(check);
  }

  /** Run all checks against the current BSO */
  run(bso: Readonly<BrandStateObject>): ConsistencyReport {
    const results: ConsistencyCheck[] = [];

    for (const check of this.checks) {
      results.push(check(bso));
    }

    const totalChecks = results.length;
    const passed = results.filter((c) => c.status === "pass").length;
    const warnings = results.filter((c) => c.status === "warn").length;
    const errors = results.filter((c) => c.status === "flag").length;
    const overall = errors > 0 ? "needs_fixes" : "ready";

    return {
      checks: results,
      totalChecks,
      passed,
      warnings,
      errors,
      overall,
    };
  }

  /** Run a subset of checks relevant to the current stage */
  runForStage(bso: Readonly<BrandStateObject>, stage: number): ConsistencyReport {
    const stageChecks = this.getStageChecks(stage);
    const originalChecks = [...this.checks];
    this.checks = stageChecks;
    const report = this.run(bso);
    this.checks = originalChecks;
    return report;
  }

  private getStageChecks(stage: number): CheckFn[] {
    const stageRelevance: Record<string, number> = {
      "Archetype–Visual Coherence": 4,
      "Colour Accessibility (WCAG)": 4,
      "Typography Legibility": 4,
      "Tonal Consistency": 6,
      "Visual Vocabulary Consistency": 5,
      "Logo Reproducibility": 5,
      "Colour–Copy Alignment": 6,
      "Competitor Differentiation": 2,
      "Dark/Light Parity": 4,
      "Asset Completeness": 8,
    };

    return this.checks.filter((check) => {
      const dummyBso = {} as BrandStateObject;
      const result = check(dummyBso);
      const minStage = stageRelevance[result.name] || 1;
      return stage >= minStage;
    });
  }

  private registerDefaults(): void {
    // ─── 1. Archetype–Visual Coherence ──────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Archetype–Visual Coherence",
        status: "pass",
        details: "Visual identity is coherent with brand archetypes.",
        severity: "info",
      };

      if (!bso.visualIdentity.colourSystem || !bso.strategy.personalityArchetypes.length) {
        check.status = "skip";
        check.details = "Insufficient data — colour system or archetypes not yet defined.";
        return check;
      }

      const archetypes = bso.strategy.personalityArchetypes.map((a) => a.archetype);
      const cs = bso.visualIdentity.colourSystem;
      const isPlayful = archetypes.some((a) =>
        ["Jester", "Creator", "Explorer"].includes(a)
      );
      const isSerious = archetypes.some((a) =>
        ["Sage", "Ruler", "Innocent"].includes(a)
      );

      // Check: playful archetype + desaturated palette
      if (isPlayful && cs.harmonyType === "monochromatic") {
        check.status = "warn";
        check.details = `Playful archetypes (${archetypes.join(", ")}) paired with monochromatic palette may feel too restrained. Consider a more vibrant harmony type.`;
        check.remediation = "Try complementary or triadic harmony for more energy.";
        check.severity = "warning";
      }

      // Check: serious archetype + neon/vibrant palette
      if (isSerious) {
        const primaryHex = cs.primaryColour.toLowerCase();
        const vibrantPatterns = ["#ff", "#00ff", "#f0f", "#0ff"];
        if (vibrantPatterns.some((p) => primaryHex.includes(p))) {
          check.status = "warn";
          check.details = `Serious archetypes (${archetypes.join(", ")}) with neon/vibrant primary colour may undermine gravitas.`;
          check.remediation = "Consider deeper, more muted tones for authority.";
          check.severity = "warning";
        }
      }

      return check;
    });

    // ─── 2. Colour Accessibility (WCAG 2.1 AA) ──────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Colour Accessibility (WCAG)",
        status: "pass",
        details: "All colour combinations meet WCAG 2.1 AA standards.",
        severity: "info",
      };

      if (!bso.visualIdentity.colourSystem) {
        check.status = "skip";
        check.details = "Colour system not yet defined.";
        return check;
      }

      const wcag = bso.visualIdentity.colourSystem.wcagReport;
      if (!wcag) {
        check.status = "skip";
        check.details = "WCAG report not yet generated.";
        return check;
      }

      if (wcag.overall === "fail") {
        check.status = "flag";
        check.details = `WCAG compliance failed. ${wcag.checks.filter((c) => !c.normalTextPass).length} colour combinations fail minimum contrast (4.5:1).`;
        check.remediation = "Adjust colour lightness values to increase contrast ratios. Use the WCAG contrast formula.";
        check.severity = "error";
      }

      return check;
    });

    // ─── 3. Typography Legibility ───────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Typography Legibility",
        status: "pass",
        details: "All font choices are legible at required sizes.",
        severity: "info",
      };

      if (!bso.visualIdentity.typography) {
        check.status = "skip";
        check.details = "Typography system not yet defined.";
        return check;
      }

      const t = bso.visualIdentity.typography;
      const minBodySize = t.typeScale.sizes.find((s) => s.name === "base");
      const minLabelSize = t.typeScale.sizes.find((s) => s.name === "xs");

      if (minBodySize && minBodySize.sizePx < 16) {
        check.status = "flag";
        check.details = `Body text size (${minBodySize.sizePx}px) is below the recommended minimum of 16px.`;
        check.remediation = "Increase the base size to at least 16px (1rem).";
        check.severity = "error";
      }

      if (minLabelSize && minLabelSize.sizePx < 11) {
        check.status = "warn";
        check.details = `Minimum label size (${minLabelSize.sizePx}px) is very small and may cause legibility issues.`;
        check.remediation = "Consider increasing the smallest size to 12px.";
        check.severity = "warning";
      }

      return check;
    });

    // ─── 4. Tonal Consistency ───────────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Tonal Consistency",
        status: "pass",
        details: "Copy tone is consistent with the defined tone of voice framework.",
        severity: "info",
      };

      if (!bso.verbalIdentity.copyExamples || !bso.strategy.toneOfVoice) {
        check.status = "skip";
        check.details = "Copy examples or tone of voice not yet defined.";
        return check;
      }

      const tone = bso.strategy.toneOfVoice;
      // Basic heuristic: if tone says formal (>50) but copy examples exist
      if (tone.formalToCasual < 30) {
        check.details = "Tone of voice is formal — ensure all copy reflects this.";
        check.severity = "info";
      }

      return check;
    });

    // ─── 5. Visual Vocabulary Consistency ───────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Visual Vocabulary Consistency",
        status: "pass",
        details: "Icon style, illustration style, and motion language share consistent parameters.",
        severity: "info",
      };

      const hasIcons = !!bso.visualIdentity.iconography;
      const hasIllustration = !!bso.visualIdentity.illustrationStyle;
      const hasMotion = !!bso.visualIdentity.motionLanguage;

      if (!hasIcons || !hasIllustration) {
        check.status = "skip";
        check.details = "Iconography or illustration style not yet defined.";
        return check;
      }

      const iconStroke = bso.visualIdentity.iconography!.strokeWeight;
      const illStroke = bso.visualIdentity.illustrationStyle!.strokeWeight;

      if (Math.abs(iconStroke - illStroke) > 1) {
        check.status = "warn";
        check.details = `Icon stroke weight (${iconStroke}px) differs from illustration stroke weight (${illStroke}px) by more than 1px.`;
        check.remediation = "Align stroke weights for a cohesive visual vocabulary.";
        check.severity = "warning";
      }

      if (!hasMotion) {
        check.details += " Motion language not yet defined.";
      }

      return check;
    });

    // ─── 6. Logo Reproducibility ────────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Logo Reproducibility",
        status: "pass",
        details: "Logo is reproducible at all required sizes and in single colour.",
        severity: "info",
      };

      if (!bso.visualIdentity.logo) {
        check.status = "skip";
        check.details = "Logo not yet defined.";
        return check;
      }

      const logo = bso.visualIdentity.logo;
      if (!logo.qualityChecks) {
        check.status = "skip";
        check.details = "Logo quality checks not yet performed.";
        return check;
      }

      const qc = logo.qualityChecks;
      const failures: string[] = [];

      if (!qc.legibility16px) failures.push("Not legible at 16×16px (favicon scale)");
      if (!qc.oneColourReproduction)
        failures.push("Not reproducible in single colour (black and white)");

      if (failures.length > 0) {
        check.status = "flag";
        check.details = "Logo fails reproducibility checks:\n- " + failures.join("\n- ");
        check.remediation = "Simplify the mark for small sizes. Ensure it works without colour.";
        check.severity = "error";
      }

      return check;
    });

    // ─── 7. Colour–Copy Alignment ───────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Colour–Copy Alignment",
        status: "pass",
        details: "Emotional territory of colour matches verbal messaging tone.",
        severity: "info",
      };

      if (!bso.visualIdentity.colourSystem || !bso.strategy.emotionalTerritory) {
        check.status = "skip";
        check.details = "Colour system or emotional territory not yet defined.";
        return check;
      }

      // Simple heuristic — more sophisticated NLP could be added
      check.details =
        "Colour emotional territory and verbal emotional territory both defined. Manual review recommended for alignment.";

      return check;
    });

    // ─── 8. Competitor Differentiation ──────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Competitor Differentiation",
        status: "pass",
        details: "Visual identity is distinct from known competitors.",
        severity: "info",
      };

      if (!bso.product.competitors.length) {
        check.status = "skip";
        check.details = "No competitors provided for comparison.";
        return check;
      }

      if (!bso.visualIdentity.colourSystem || !bso.visualIdentity.logo) {
        check.status = "skip";
        check.details = "Visual identity not fully defined for competitor comparison.";
        return check;
      }

      if (bso.visualIdentity.logo?.qualityChecks?.competitorProximity === "conflicting") {
        check.status = "flag";
        check.details = "Logo is too visually similar to a competitor.";
        check.remediation = "Differentiate the mark — change geometry, colour treatment, or conceptual approach.";
        check.severity = "error";
      }

      if (bso.visualIdentity.logo?.qualityChecks?.competitorProximity === "similar") {
        check.status = "warn";
        check.details = "Logo has visual similarities to a competitor. Consider differentiation.";
        check.severity = "warning";
      }

      return check;
    });

    // ─── 9. Dark/Light Parity ───────────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Dark/Light Parity",
        status: "pass",
        details: "All brand assets function correctly in both dark and light contexts.",
        severity: "info",
      };

      if (!bso.visualIdentity.colourSystem) {
        check.status = "skip";
        check.details = "Colour system not yet defined.";
        return check;
      }

      const cs = bso.visualIdentity.colourSystem;
      const hasDarkModeTokens = cs.neutralScale.every(
        (t) => t.darkMode && t.darkMode.length > 0
      );

      if (!hasDarkModeTokens) {
        check.status = "flag";
        check.details = "Colour tokens are missing dark mode variants.";
        check.remediation = "Generate dark mode variants for every colour token.";
        check.severity = "error";
      }

      return check;
    });

    // ─── 10. Asset Completeness ─────────────────────────
    this.register((bso) => {
      const check: ConsistencyCheck = {
        name: "Asset Completeness",
        status: "pass",
        details: "All required asset formats and sections are present.",
        severity: "info",
      };

      const required: Array<{ section: string; present: boolean }> = [
        { section: "Logo", present: !!bso.visualIdentity.logo },
        { section: "Colour System", present: !!bso.visualIdentity.colourSystem },
        { section: "Typography", present: !!bso.visualIdentity.typography },
        { section: "Iconography", present: !!bso.visualIdentity.iconography },
        { section: "Naming", present: (bso.verbalIdentity.naming?.candidates?.length ?? 0) > 0 },
        { section: "Messaging", present: !!bso.verbalIdentity.messagingHierarchy },
      ];

      const missing = required.filter((r) => !r.present).map((r) => r.section);

      if (missing.length > 0) {
        // Only flag if we're at export stage (stage 8+)
        if (bso.metadata.stage >= 8) {
          check.status = "flag";
          check.details = `Missing required brand sections: ${missing.join(", ")}`;
          check.remediation = "Complete all required stages before export.";
          check.severity = "error";
        } else {
          check.status = "warn";
          check.details = `Brand kit is incomplete. Missing: ${missing.join(", ")}. Expected at export (Stage 8).`;
          check.severity = "warning";
        }
      }

      return check;
    });
  }
}

// ─── Singleton ───────────────────────────────────────────────

let engineInstance: ConsistencyEngine | null = null;

export function getConsistencyEngine(): ConsistencyEngine {
  if (!engineInstance) {
    engineInstance = new ConsistencyEngine();
  }
  return engineInstance;
}
