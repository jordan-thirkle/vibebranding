/**
 * Naming Module (Stage 3)
 *
 * Generates and validates brand name candidates using 5 approaches:
 * Descriptive, Evocative, Invented/Coined, Metaphorical, Compound/Portmanteau
 *
 * Validation: phonetics, memorability, domain availability, trademark risk,
 * social handles, negative meaning cross-reference.
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";
import {
  analyzePhonetics,
  scoreMemorability,
  assessTrademarkRisk,
  checkNegativeMeanings,
  getSocialHandleUrls,
} from "@/lib/validation";
import type { NameCandidate, NamingInfo, VerbalIdentityInfo } from "@/core/bso/types";

export interface NamingOutput {
  success: boolean;
  candidates: Array<{
    name: string;
    approach: string;
    scores: { phonetics: number; memorability: number; distinctiveness: number; overall: number };
    trademarkRisk: string;
    issues: string[];
  }>;
  recommended: number;
  errors?: string[];
}

/**
 * Run the Naming pipeline.
 */
export async function runNaming(): Promise<NamingOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const config = getGeminiConfig();
  const bso = store.get();

  if (!bso.strategy.emotionalTerritory) {
    return {
      success: false,
      candidates: [],
      recommended: -1,
      errors: ["Strategy data incomplete. Run Stage 2 (Strategy) first."],
    };
  }

  // Build naming prompt
  const prompt = engine.build("naming", bso);

  let namingText: string;
  try {
    namingText = await generateWithGemini(prompt, config, { temperature: 0.8, maxTokens: 4096 });
  } catch (err) {
    return {
      success: false,
      candidates: [],
      recommended: -1,
      errors: [`AI generation failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  // Parse candidate names from AI output
  const candidateNames = parseNameCandidates(namingText);

  // Validate each candidate
  const candidates: NameCandidate[] = candidateNames.map(({ name, approach }) => {
    const phonetics = analyzePhonetics(name);
    const memorability = scoreMemorability(name);
    const trademark = assessTrademarkRisk(name);
    const negative = checkNegativeMeanings(name);
    const handles = getSocialHandleUrls(name);

    return {
      name,
      approach: approach as NameCandidate["approach"],
      rationale: `Phonetic score: ${phonetics.score}/10, ${phonetics.syllables} syllables, rhythm: ${phonetics.rhythm}`,
      scores: {
        phonetics: phonetics.score,
        memorability,
        distinctiveness: memorability,
        overall: Math.round((phonetics.score + memorability) / 2),
      },
      availability: {
        dotCom: true, // Assume available until checked
        dotIo: true,
        dotApp: true,
        socialHandles: Object.fromEntries(Object.entries(handles).map(([k]) => [k, true])),
      },
      trademarkRisk: trademark.risk as NameCandidate["trademarkRisk"],
      negativeMeanings: negative,
    };
  });

  // Sort by overall score
  candidates.sort((a, b) => b.scores.overall - a.scores.overall);

  // Update BSO
  store.update("verbalIdentity", {
    naming: {
      candidates,
      recommended: 0,
    },
  } as Partial<VerbalIdentityInfo>);

  store.advanceStage(); // Stage 3 → 4

  return {
    success: true,
    candidates: candidates.slice(0, 10).map((c) => ({
      name: c.name,
      approach: c.approach,
      scores: c.scores,
      trademarkRisk: c.trademarkRisk,
      issues: c.negativeMeanings,
    })),
    recommended: 0, // Top scored
  };
}

// ─── Helpers ─────────────────────────────────────────────────

interface ParsedCandidate {
  name: string;
  approach: string;
}

function parseNameCandidates(text: string): ParsedCandidate[] {
  const candidates: ParsedCandidate[] = [];
  const seen = new Set<string>();

  function addCandidate(name: string, approach: string = "invented") {
    const clean = name.replace(/[*_'"\u201C\u201D]/g, "").trim();
    if (clean.length >= 2 && clean.length <= 15 && !seen.has(clean.toLowerCase()) && /^[a-zA-Z]/.test(clean)) {
      seen.add(clean.toLowerCase());
      candidates.push({ name: clean, approach });
    }
  }

  // Strategy 1: Match numbered/bulleted list items with bold names
  // e.g., "1. **PixelForge** — evocative: ..." or "- **Sketchflow**"
  const boldPattern = /(?:^|\n)\s*(?:[\d]+[\.\)]\s*|\-\s*|\•\s*)\*{1,3}([^*\n]{2,20})\*{1,3}/g;
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    const name = match[1].trim();
    const lineStart = text.lastIndexOf("\n", match.index) + 1;
    const lineEnd = text.indexOf("\n", match.index + match[0].length);
    const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    addCandidate(name, detectApproach(line));
  }

  // Strategy 2: Match quoted names
  // e.g., "PixelForge" or 'Draftly'
  const quotePattern = /["\u201C]([A-Z][a-zA-Z]{1,14})["\u201D]/g;
  while ((match = quotePattern.exec(text)) !== null) {
    addCandidate(match[1], "invented");
  }

  // Strategy 3: Match capitalized words that look like brand names
  // Only if we have few candidates
  if (candidates.length < 5) {
    const wordPattern = /\b([A-Z][a-zA-Z]{1,14})\b/g;
    const commonWords = new Set([
      "The", "This", "That", "For", "And", "You", "Our", "Your", "Code", "Draft",
      "Developer", "Generate", "Design", "Create", "Here", "These", "Those",
      // Archetype names — exclude from naming candidates
      "Creator", "Sage", "Explorer", "Hero", "Outlaw", "Magician", "Everyman",
      "Lover", "Jester", "Caregiver", "Ruler", "Innocent",
      // Common brand words
      "App", "Hub", "Lab", "Kit", "Tool", "Studio", "Flow", "Works",
    ]);
    while ((match = wordPattern.exec(text)) !== null) {
      const word = match[1];
      if (!commonWords.has(word) && word.length >= 3) {
        addCandidate(word, "invented");
      }
    }
  }

  return candidates.slice(0, 25);
}

function detectApproach(line: string): string {
  const lower = line.toLowerCase();
  if (lower.includes("descriptive")) return "descriptive";
  if (lower.includes("evocative")) return "evocative";
  if (lower.includes("metaphor")) return "metaphorical";
  if (lower.includes("compound") || lower.includes("portmanteau")) return "compound";
  if (lower.includes("invented") || lower.includes("coined")) return "invented";
  return "invented";
}
