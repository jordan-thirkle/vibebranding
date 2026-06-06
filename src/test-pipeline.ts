// Full pipeline test: VibeBranding
// Run with: npx tsx src/test-pipeline.ts

import { resetBsoStore, getBsoStore } from "./core/bso";
import { getPromptEngine, registerAllTemplates } from "./core/prompt-engine/index";
import { runDiscovery } from "./modules/discovery/index";
import { runStrategy } from "./modules/strategy/index";
import { runNaming } from "./modules/naming/index";
import { runColourSystem } from "./modules/color/index";
import { runTypography } from "./modules/typography/index";
import { runVerbalIdentity } from "./modules/verbal/index";
import { getConsistencyEngine } from "./core/consistency-engine/index";

// Register templates
registerAllTemplates(getPromptEngine());

async function main() {
  console.log("🚀 VibeBranding Pipeline Test\n");
  console.log("=" .repeat(60));

  resetBsoStore();

  // ─── Stage 1: Discovery ────────────────────────────
  console.log("\n📋 Stage 1: Discovery");
  const d = await runDiscovery({
    productName: "PixelForge",
    description: "An AI-powered design tool that transforms rough sketches into production-ready UI components. Designers draw, PixelForge generates clean code.",
    category: "Design Tool / Developer Tool",
    audienceDemographics: "UI/UX designers and frontend developers, age 22-40, tech-savvy",
    competitorNames: ["Figma", "Galileo AI", "Uizard"],
    personalityKeywords: ["creative", "precise", "magical"],
  });

  if (!d.success) { console.error("❌ Discovery failed:", d.errors); return; }
  console.log("   Positioning:", d.positioningStatement?.slice(0, 100));
  console.log("   ✅ Done");

  // ─── Stage 2: Strategy ──────────────────────────────
  console.log("\n🎯 Stage 2: Strategy");
  const s = await runStrategy();
  if (!s.success) { console.error("❌ Strategy failed:", s.errors); return; }
  console.log("   Archetypes:", s.archetypes.map(a => `${a.name}(${a.weight}%)`).join(", "));
  console.log("   Territory:", s.emotionalTerritory);
  console.log("   Values:", s.values.join(", "));
  console.log("   ✅ Done");

  // ─── Stage 3: Naming ────────────────────────────────
  console.log("\n🏷️  Stage 3: Naming");
  const n = await runNaming();
  if (!n.success) { console.error("❌ Naming failed:", n.errors); return; }
  console.log("   Top names:", n.candidates.slice(0, 5).map(c => c.name).join(", "));
  console.log("   ✅ Done");

  // ─── Stage 4: Colour + Typography ────────────────────
  console.log("\n🎨 Stage 4: Colour System");
  const c = await runColourSystem();
  if (!c.success) { console.error("❌ Colour failed:", c.errors); return; }
  console.log("   Primary:", c.primary, "| Secondary:", c.secondary, "| Accent:", c.accent);
  console.log("   Harmony:", c.harmonyType, "| WCAG:", c.wcagPassed ? "PASS" : "FAIL");
  console.log("   ✅ Done");

  console.log("\n🔤 Stage 4: Typography");
  const t = await runTypography();
  if (!t.success) { console.error("❌ Typography failed:", t.errors); return; }
  console.log("   Display:", t.displayFont, "| Text:", t.textFont);
  console.log("   Scale:", t.typeScaleRatio);
  console.log("   ✅ Done");

  // ─── Stage 5: Logo (skipped for speed) ──────────────
  console.log("\n🖼️  Stage 5: Logo (skipped — requires Replicate API key)");

  // ─── Stage 6: Verbal Identity ───────────────────────
  console.log("\n✍️  Stage 6: Verbal Identity");
  const v = await runVerbalIdentity();
  if (!v.success) { console.error("❌ Verbal failed:", v.errors); return; }
  console.log("   Headline:", v.heroHeadline);
  console.log("   CTA:", v.primaryCTA);
  console.log("   Top taglines:", v.taglines.slice(0, 3).map(t => `"${t.text}"`).join(", "));
  console.log("   ✅ Done");

  // ─── BCE Validation ─────────────────────────────────
  console.log("\n🔍 Brand Consistency Engine");
  const bso = getBsoStore().get();
  const ce = getConsistencyEngine();
  const report = ce.run(bso);
  console.log("   Checks:", report.totalChecks);
  console.log("   Passed:", report.passed, "| Warnings:", report.warnings, "| Errors:", report.errors);
  console.log("   Overall:", report.overall.toUpperCase());

  // ─── Summary ────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("✨ Pipeline complete!");
  console.log(`   Brand: ${bso.product.name}`);
  console.log(`   Territory: ${bso.strategy.emotionalTerritory}`);
  console.log(`   Palette: ${bso.visualIdentity.colourSystem?.primaryColour || "N/A"}`);
  console.log(`   Font: ${bso.visualIdentity.typography?.displayFont.name || "N/A"}`);

  // Export BSO
  console.log("\n📦 Full BSO exported to exports/bso.json");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "exports");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "bso.json"), getBsoStore().toJSON(), "utf-8");
  console.log("   ✅ Saved");
}

main().catch((err) => {
  console.error("💥 Pipeline crashed:", err);
  process.exit(1);
});
