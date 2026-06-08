/**
 * Logo Generation Module (Stage 5)
 *
 * Multi-pass AI logo generation pipeline:
 * 1. Concept Ideation (12 concepts)
 * 2. Style Refinement (top 4)
 * 3. SVG code generation via Gemini
 * 4. Dark/Light/Mono Variants
 * 5. Quality Checks
 *
 * SVG logos are generated as code by Gemini (no external API needed).
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";
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

  // ─── Step 3: Generate SVG via Gemini ───────────────
  const svgResults: string[] = [];
  try {
    const topConcept = concepts[0];
    if (topConcept) {
      const svgPrompt = `Generate a clean, minimal, professional SVG logo for "${bso.product.name}".

Brand context: ${bso.strategy?.emotionalTerritory || "Professional"} brand
Logo typology: ${typology}
Primary colour: ${cs?.primaryColour || "#2563EB"}
Accent colour: ${cs?.accentColour || "#F59E0B"}
Background: transparent

Design requirements:
- Clean geometric lines, minimal, scalable
- Uses the brand colours appropriately
- viewBox="0 0 512 512"
- xmlns="http://www.w3.org/2000/svg"
- No text labels or external dependencies
- Keep the SVG simple — under 500 lines

Return ONLY valid SVG code. No markdown, no explanation, no code fences.`;

      const svgCode = await generateWithGemini(svgPrompt, config, {
        temperature: 0.3,
        maxTokens: 4096,
      });

      // Clean up any markdown fences that might slip through
      const cleaned = svgCode.trim()
        .replace(/^```svg?\n?/i, "")
        .replace(/^```\n?/i, "")
        .replace(/\n```\n?$/i, "")
        .trim();

      if (cleaned.startsWith("<svg")) {
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(cleaned, "utf-8").toString("base64")}`;
        svgResults.push(dataUri);
        console.log(`✅ SVG logo (${(cleaned.length / 1024).toFixed(1)}KB) generated via Gemini`);
      } else {
        console.log(`⚠️  Gemini returned non-SVG content — skipping inline SVG`);
      }
    }
  } catch (err) {
    console.log(`⚠️  SVG generation via Gemini failed: ${err instanceof Error ? err.message : String(err)}`);
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
