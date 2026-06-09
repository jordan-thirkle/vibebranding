/**
 * Brand Strategy Module (Stage 2)
 *
 * Defines the strategic foundation:
 * - Brand Archetypes (12 Jungian, weighted blends)
 * - Personality Spectrum (5 axes)
 * - Emotional Territory
 * - Brand Values (3-5)
 * - Tone of Voice Framework (4 dimensions)
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateText } from "@/ai/fallback";
import { ARCHETYPES, getSpectrumFromArchetypes, getToneFromArchetypes } from "@/lib/branding-frameworks";
import type { BrandArchetype, StrategyInfo, BrandStateObject } from "@/core/bso/types";

export interface StrategyOutput {
  success: boolean;
  archetypes: Array<{ name: string; weight: number; rationale: string }>;
  emotionalTerritory: string;
  values: string[];
  toneSummary: string;
  errors?: string[];
}

/**
 * Run the Brand Strategy pipeline.
 * Reads discovery data from BSO, generates strategy, updates BSO.
 */
export async function runStrategy(): Promise<StrategyOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const bso = store.get();

  // Validate prerequisites
  if (!bso.product.name || !bso.product.description) {
    return {
      success: false,
      archetypes: [],
      emotionalTerritory: "",
      values: [],
      toneSummary: "",
      errors: ["Discovery data incomplete. Run Stage 1 (Discovery) first."],
    };
  }

  // Build strategy prompt from discovery BSO
  const prompt = engine.build("strategy", bso);

  let strategyText: string;
  try {
    strategyText = await generateText(prompt, { temperature: 0.5, maxTokens: 4096 });
  } catch (err) {
    return {
      success: false,
      archetypes: [],
      emotionalTerritory: "",
      values: [],
      toneSummary: "",
      errors: [`AI generation failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  // ── Parse Archetypes ────────────────────────────────
  const archetypeNames = extractArchetypes(strategyText);
  const archetypes: BrandArchetype[] = archetypeNames.map((name, i) => {
    const def = ARCHETYPES[name];
    return {
      archetype: name as BrandArchetype["archetype"],
      weight: Math.round(100 - i * 15 > 10 ? 100 - i * 15 : 15), // Primary gets highest weight
      rationale: def ? `${def.motto} — ${def.desire}` : "AI-selected archetype",
    };
  });

  // ── Parse Emotional Territory ───────────────────────
  const rawTerritory = extractField(strategyText, "emotional territory") ||
    extractField(strategyText, "emotional") ||
    "confident clarity";
  // Extract just the key phrase (usually in quotes or bold)
  const territoryMatch = rawTerritory.match(/["\u201C]([^"\u201D]{3,40})["\u201D]/) || rawTerritory.match(/\*\*([^*]{3,40})\*\*/);
  const emotionalTerritory = territoryMatch ? territoryMatch[1].trim() : rawTerritory.slice(0, 60).replace(/\n/g, " ").trim();

  // ── Parse Values ────────────────────────────────────
  const valuesText = extractField(strategyText, "values") || extractField(strategyText, "brand values");
  const rawValues = valuesText
    ? valuesText
        .split(/[\n]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    : [];

  const values = rawValues
    // Strip markdown headers, numbers, bullets
    .map((v) => v.replace(/^#{1,4}\s*/, "").replace(/^\d+[\.\)]\s*/, "").replace(/^[\•\-\*]\s*/, ""))
    // Strip bold/italic markers AND leading/trailing whitespace
    .map((v) => v.replace(/\*{1,3}/g, "").replace(/_{1,3}/g, "").trim())
    // Extract just the value name before colon, dash, comma, or newline explanation
    .map((v) => v.split(/[:\-\u2013\u2014,]\s/)[0].trim())
    // Remove lines that are clearly not values
    .filter((v) =>
      v.length > 3 &&
      v.length < 40 &&
      !v.toLowerCase().startsWith("what it") &&
      !v.toLowerCase().startsWith("actionable") &&
      !v.toLowerCase().startsWith("definition") &&
      !v.toLowerCase().startsWith("why it") &&
      !v.toLowerCase().startsWith("example") &&
      !v.toLowerCase().startsWith("how to") &&
      v.split(" ").length <= 5
    )
    // Deduplicate
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 5);

  // ── Generate Spectrum from Archetypes ───────────────
  const archetypeDefs = archetypes.map((a) => ARCHETYPES[a.archetype]).filter(Boolean);
  const spectrum = getSpectrumFromArchetypes(archetypeDefs);

  // ── Generate Tone from Archetypes ───────────────────
  const tone = getToneFromArchetypes(archetypeDefs);

  // ── Update BSO ──────────────────────────────────────
  store.update("strategy", {
    personalityArchetypes: archetypes,
    personalitySpectrum: spectrum,
    emotionalTerritory,
    brandValues: values,
    toneOfVoice: tone,
  } as Partial<StrategyInfo>);

  store.advanceStage(); // Stage 2 → 3

  const toneSummary = [
    `Formal ↔ Casual: ${tone.formalToCasual}/100`,
    `Serious ↔ Witty: ${tone.seriousToWitty}/100`,
    `Authoritative ↔ Approachable: ${tone.authoritativeToApproachable}/100`,
    `Conventional ↔ Irreverent: ${tone.conventionalToIrreverent}/100`,
  ].join(" | ");

  return {
    success: true,
    archetypes: archetypes.map((a) => ({
      name: a.archetype,
      weight: a.weight,
      rationale: a.rationale,
    })),
    emotionalTerritory,
    values,
    toneSummary,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function extractArchetypes(text: string): string[] {
  const archetypeNames = Object.keys(ARCHETYPES);
  const found: string[] = [];

  // Direct mentions
  for (const name of archetypeNames) {
    if (text.toLowerCase().includes(name.toLowerCase())) {
      found.push(name);
    }
  }

  // If none found, default based on keyword analysis
  if (found.length === 0) {
    if (text.toLowerCase().includes("innov")) found.push("Creator");
    if (text.toLowerCase().includes("trust")) found.push("Everyman");
    if (text.toLowerCase().includes("power")) found.push("Ruler");
    if (text.toLowerCase().includes("fun") || text.toLowerCase().includes("play")) found.push("Jester");
    if (text.toLowerCase().includes("wisdom") || text.toLowerCase().includes("expert")) found.push("Sage");
    if (text.toLowerCase().includes("freedom") || text.toLowerCase().includes("explore")) found.push("Explorer");
  }

  // Fallback
  if (found.length === 0) {
    found.push("Creator", "Explorer");
  }

  return found.slice(0, 3); // Max 3 archetypes
}

function extractField(text: string, fieldName: string): string {
  const patterns = [
    new RegExp(`#{1,3}\\s*.*${fieldName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n#{1,3}|$)`, "i"),
    new RegExp(`\\*\\*.*${fieldName}[^*]*\\*\\*[：:]\\s*(.+?)(?:\\n|$)`, "i"),
    new RegExp(`${fieldName}[：:]\\s*(.+?)(?:\\n|$)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return "";
}
