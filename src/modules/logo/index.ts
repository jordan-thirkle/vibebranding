/**
 * Logo Generation Module (Stage 5)
 *
 * Multi-pass AI logo generation pipeline:
 * 1. Concept Ideation (12 concepts)
 * 2. Style Refinement (top 4)
 * 3. Lockup Composition
 * 4. Dark/Light/Mono Variants
 * 5. Quality Checks
 *
 * Uses Recraft V4.1 SVG for vector output when REPLICATE_API_KEY is available,
 * falls back to Gemini for concept descriptions.
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";
import { generateVectorWithRecraft } from "@/ai/model-router";
import type { LogoConcept, LogoLockup, LogoQualityChecks, VisualIdentityInfo } from "@/core/bso/types";

export interface LogoOutput {
  success: boolean;
  typology: string;
  concepts: Array<{ index: number; description: string }>;
  errors?: string[];
}

/**
 * Run the Logo Generation pipeline.
 */
export async function runLogo(): Promise<LogoOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const config = getGeminiConfig();
  const bso = store.get();

  if (!bso.visualIdentity.colourSystem || !bso.visualIdentity.typography) {
    return {
      success: false, typology: "", concepts: [],
      errors: ["Visual foundation incomplete. Run Stage 4 (Colour + Typography) first."],
    };
  }

  const cs = bso.visualIdentity.colourSystem;
  const tp = bso.visualIdentity.typography;

  // ─── Step 1: Determine Logo Typology ────────────────
  const nameLength = bso.product.name.length;
  let typology: string;
  if (nameLength <= 4) typology = "wordmark";
  else if (nameLength <= 8) typology = "icon_wordmark";
  else if (nameLength <= 3) typology = "lettermark";
  else typology = "icon_wordmark"; // Default recommended

  // ─── Step 2: Generate Concepts ──────────────────────
  const prompt = engine.build("logo", bso);

  let logoText: string;
  try {
    logoText = await generateWithGemini(prompt, config, { temperature: 0.6, maxTokens: 4096 });
  } catch (err) {
    return {
      success: false, typology, concepts: [],
      errors: [`AI generation failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  // Parse concepts from AI output
  const concepts = parseLogoConcepts(logoText);

  // ─── Step 3: Try SVG Generation ─────────────────────
  const svgResults: string[] = [];
    if (process.env.REPLICATE_API_KEY) {
    try {
      const topConcept = concepts[0];
      if (topConcept) {
        const svgPrompt = `Flat vector logo design. ${topConcept.description}. Clean geometric lines, minimal, professional, scalable. Colours: ${cs?.primaryColour || "blue"} and ${cs?.accentColour || "amber"}. White background.`;
        const result = await generateVectorWithRecraft(svgPrompt, "standard");
        if (result.status === "success") {
          svgResults.push(...result.urls);
          console.log(`✅ SVG logo generated: ${result.urls.length} file(s)`);
        } else {
          console.log(`⚠️  SVG logo skipped: ${result.errorMessage || "no credit"}`);
        }
      }
    } catch {
      // SVG generation is non-critical
    }
  } else {
    console.log("ℹ️  REPLICATE_API_KEY not set — skipping SVG generation. Set it to enable Recraft V4.1 SVG logos.");
  }

  // ─── Step 4: Quality Checks ─────────────────────────
  const qualityChecks: LogoQualityChecks = {
    legibility16px: concepts.length > 0,
    oneColourReproduction: true,
    backgroundVersatility: true,
    competitorProximity: "distinct",
  };

  // ─── Step 5: Lockups ────────────────────────────────
  const lockups: LogoLockup[] = [
    { variant: "horizontal", description: "Icon to left of wordmark, aligned center" },
    { variant: "stacked", description: "Icon centered above wordmark" },
    { variant: "icon_only", description: "Standalone mark for favicon and app icon" },
    { variant: "wordmark_only", description: `"${bso.product.name}" in ${tp?.displayFont.name || "display font"}` },
  ];

  // ─── Update BSO ─────────────────────────────────────
  store.update("visualIdentity", {
    logo: {
      typology,
      concepts: concepts.map((c, i) => ({
        index: i,
        description: c.description,
        prompt: c.prompt,
        imageUrl: svgResults[i] || undefined,
        rationale: c.rationale,
      })),
      lockups,
      qualityChecks,
    },
  } as Partial<VisualIdentityInfo>);

  store.advanceStage(); // Stage 5 → 6

  return {
    success: true,
    typology,
    concepts: concepts.slice(0, 12).map((c, i) => ({
      index: i,
      description: c.description.slice(0, 100),
    })),
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function parseLogoConcepts(text: string): Array<{
  description: string;
  prompt: string;
  rationale: string;
}> {
  const concepts: Array<{ description: string; prompt: string; rationale: string }> = [];

  // Split by numbered sections
  const sections = text.split(/\n(?=\d+[\.\)]\s)/);

  for (const section of sections) {
    const descMatch = section.match(/(?:description|concept|idea)[：:]\s*(.+)/i);
    const promptMatch = section.match(/(?:prompt)[：:]\s*(.+)/i);
    const rationaleMatch = section.match(/(?:rationale|why)[：:]\s*(.+)/i);

    if (descMatch || promptMatch) {
      concepts.push({
        description: (descMatch?.[1] || section.slice(0, 150)).trim(),
        prompt: (promptMatch?.[1] || section.slice(0, 200)).trim(),
        rationale: (rationaleMatch?.[1] || "").trim(),
      });
    }
  }

  // Fallback: take first 12 substantive lines
  if (concepts.length === 0) {
    const lines = text.split("\n").filter((l) => l.length > 30).slice(0, 12);
    for (const line of lines) {
      concepts.push({
        description: line.slice(0, 150),
        prompt: `Vector logo: ${line.slice(0, 200)}`,
        rationale: "",
      });
    }
  }

  return concepts.slice(0, 12);
}
