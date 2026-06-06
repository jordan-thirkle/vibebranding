/**
 * Verbal Identity Module (Stage 6)
 *
 * Generates the complete verbal expression of the brand:
 * - 20 tagline candidates across 5 approaches
 * - Messaging hierarchy (5 levels)
 * - Tone of voice examples
 * - Microcopy (buttons, errors, empty states, tooltips, success, loading)
 * - Brand vocabulary (owned words, avoided words, naming conventions)
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine } from "@/core/prompt-engine/index";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";
import type { TaglineCandidate, MessagingHierarchy, CopyExamples, VerbalIdentityInfo } from "@/core/bso/types";

export interface VerbalOutput {
  success: boolean;
  taglines: Array<{ text: string; approach: string; score: number }>;
  heroHeadline: string;
  primaryCTA: string;
  errors?: string[];
}

/**
 * Run the Verbal Identity pipeline.
 */
export async function runVerbalIdentity(): Promise<VerbalOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const config = getGeminiConfig();
  const bso = store.get();

  if (!bso.strategy.emotionalTerritory || !bso.verbalIdentity.naming) {
    return {
      success: false, taglines: [], heroHeadline: "", primaryCTA: "",
      errors: ["Strategy and naming data incomplete. Run Stages 2-3 first."],
    };
  }

  const prompt = engine.build("copywriting", bso);

  let copyText: string;
  try {
    copyText = await generateWithGemini(prompt, config, { temperature: 0.7, maxTokens: 8192 });
  } catch (err) {
    return {
      success: false, taglines: [], heroHeadline: "", primaryCTA: "",
      errors: [`AI generation failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  // ── Parse Taglines ──────────────────────────────────
  const taglines: TaglineCandidate[] = parseTaglines(copyText);

  // ── Parse Messaging ─────────────────────────────────
  const heroHeadline = extractField(copyText, "hero headline") ||
    extractField(copyText, "headline") ||
    `${bso.product.name}: ${bso.strategy.emotionalTerritory}`;

  const subHeadline = extractField(copyText, "sub-headline") ||
    extractField(copyText, "subheadline") ||
    bso.product.description.slice(0, 100);

  const bodyDescription = extractField(copyText, "body") ||
    extractField(copyText, "description") ||
    bso.product.description;

  const primaryCTA = extractField(copyText, "primary cta") ||
    extractField(copyText, "cta") ||
    "Get Started";

  const secondaryCTA = extractField(copyText, "secondary cta") || "Learn More";

  const featureHeadlines = extractListItems(copyText, "feature");

  const messagingHierarchy: MessagingHierarchy = {
    heroHeadline,
    subHeadline,
    bodyDescription,
    primaryCTA,
    secondaryCTA,
    featureHeadlines: featureHeadlines.length > 0 ? featureHeadlines : ["Simple", "Powerful", "Fast"],
  };

  // ── Parse Tone Examples ─────────────────────────────
  const onBrand = extractListItems(copyText, "on-brand") || extractListItems(copyText, "in voice");
  const tooFormal = extractListItems(copyText, "too formal") || ["We are pleased to announce our solution."];
  const tooCasual = extractListItems(copyText, "too casual") || ["Yo check this out it's dope fr fr."];

  // ── Microcopy ───────────────────────────────────────
  const copyExamples: CopyExamples = {
    toneVariations: {
      onBrand: onBrand.length > 0 ? onBrand : [`Experience ${bso.product.name}`],
      tooFormal,
      tooCasual,
    },
    microcopy: {
      buttonLabels: {
        primary: primaryCTA,
        secondary: secondaryCTA,
        destructive: "Delete",
      },
      errorMessages: {
        validation: "Please check your input and try again.",
        notFound: "We couldn't find what you're looking for.",
        serverError: "Something went wrong. We're on it.",
      },
      emptyStates: {
        noData: "Nothing here yet. Let's change that.",
        noResults: "No results found. Try a different search.",
        noNotifications: "All caught up! We'll let you know when something happens.",
      },
      onboardingTooltips: {
        welcome: "Welcome! Let's get you set up.",
        firstStep: "Start here to get going in under 2 minutes.",
      },
      successStates: {
        confirmation: "Done! That went perfectly.",
        completion: "All set. Ready for what's next?",
      },
      loadingStates: {
        skeleton: "Loading...",
        progress: "Almost there...",
      },
    },
    brandVocabulary: {
      ownedWords: [bso.product.name, ...bso.strategy.brandValues.slice(0, 3)],
      avoidedWords: [
        "revolutionary", "game-changing", "seamless", "innovative",
        "cutting-edge", "disruptive", "next-gen", "world-class",
        "leverage", "synergy", "paradigm",
      ],
      namingConventions: `Features: descriptive names. Tiers: ${bso.product.name} Free, ${bso.product.name} Pro, ${bso.product.name} Enterprise.`,
    },
  };

  // ── Update BSO ──────────────────────────────────────
  store.update("verbalIdentity", {
    taglines,
    messagingHierarchy,
    copyExamples,
  } as Partial<VerbalIdentityInfo>);

  store.advanceStage(); // Stage 6 → 7

  return {
    success: true,
    taglines: taglines.slice(0, 10).map((t) => ({
      text: t.text,
      approach: t.approach,
      score: t.scores.brandFit,
    })),
    heroHeadline,
    primaryCTA,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function parseTaglines(text: string): TaglineCandidate[] {
  const taglines: TaglineCandidate[] = [];
  const approaches: TaglineCandidate["approach"][] = ["benefit_led", "emotion_led", "imperative", "question", "positioning_condensed"];

  function isGoodTagline(t: string): boolean {
    if (t.length < 5 || t.length > 80) return false;
    // Skip markdown formatting remnants
    if (/^[\*\_\#\>\-\)\}\]\)]+$/.test(t.trim())) return false;
    if (t.includes("**") || t.includes("__") || t.startsWith("#")) return false;
    // Skip lines that are clearly explanations
    if (t.toLowerCase().startsWith("why it") || t.toLowerCase().startsWith("what it") || t.toLowerCase().startsWith("how to")) return false;
    // Must have at least some substance (not just punctuation/number)
    if (t.replace(/[^a-zA-Z]/g, "").length < 4) return false;
    return true;
  }

  // Extract quoted phrases (most reliable)
  const quoted = text.match(/["\u201C]([^"\u201D]{5,80})["\u201D]/g);
  if (quoted) {
    for (let i = 0; i < quoted.length; i++) {
      const clean = quoted[i].replace(/["\u201C\u201D]/g, "").trim();
      if (isGoodTagline(clean)) {
        taglines.push({
          text: clean,
          approach: approaches[i % approaches.length],
          scores: { memorability: 7, originality: 7, brandFit: 8, searchability: 6, internationalLegibility: 7 },
        });
      }
    }
  }

  // Extract lines that look like taglines
  for (const line of text.split("\n")) {
    const clean = line.replace(/^[\d\-\•\*\s]+/, "").replace(/[*_`]/g, "").trim();
    if (isGoodTagline(clean) && clean.length <= 60 && !taglines.find(t => t.text === clean)) {
      taglines.push({
        text: clean,
        approach: approaches[taglines.length % approaches.length],
        scores: { memorability: 6, originality: 6, brandFit: 7, searchability: 5, internationalLegibility: 6 },
      });
    }
  }

  return taglines.slice(0, 20);
}

function extractField(text: string, fieldName: string): string {
  const patterns = [
    new RegExp(`#{1,3}\\s*.*${fieldName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n#{1,3}|$)`, "i"),
    new RegExp(`\\*\\*${fieldName}[^*]*\\*\\*[：:]\\s*(.+?)(?:\\n|$)`, "i"),
    new RegExp(`${fieldName}[：:]\\s*(.+?)(?:\\n|$)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const result = match[1].trim();
      // Remove markdown formatting
      return result.replace(/[*_`]/g, "").trim();
    }
  }

  return "";
}

function extractListItems(text: string, keyword: string): string[] {
  const section = extractField(text, keyword);
  if (!section) return [];

  return section
    .split(/\n/)
    .map((l) => l.replace(/^[\d\-\•\*\s]+/, "").trim())
    .filter((l) => l.length > 3);
}
