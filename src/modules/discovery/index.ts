/**
 * Brand Discovery Module (Stage 1)
 *
 * Gathers product context through guided prompts and manifest ingestion.
 * Produces: Audience Persona Profile, Brand Positioning Statement,
 * Competitive Landscape Analysis, Brand Discovery Report.
 */

import { getBsoStore } from "@/core/bso";
import { getPromptEngine, registerAllTemplates } from "@/core/prompt-engine/index";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";
import type { ProductInfo, Competitor, BrandStateObject } from "@/core/bso/types";

// Ensure templates are registered
import "@/core/prompt-engine/templates";
registerAllTemplates(getPromptEngine());

export interface DiscoveryInput {
  productName: string;
  description: string;
  category: string;
  audienceDemographics?: string;
  audiencePsychographics?: string;
  competitorNames?: string[];
  brandInspirations?: string;
  personalityKeywords?: string[];
}

export interface DiscoveryOutput {
  success: boolean;
  audiencePersona: string;
  positioningStatement: string;
  competitorAnalysis: string;
  report: string;
  errors?: string[];
}

/**
 * Run the Brand Discovery pipeline.
 * Takes raw product input, runs AI analysis, and populates the BSO.
 */
export async function runDiscovery(input: DiscoveryInput): Promise<DiscoveryOutput> {
  const store = getBsoStore();
  const engine = getPromptEngine();
  const config = getGeminiConfig();

  // Validate input
  const errors: string[] = [];
  if (!input.productName || input.productName.length < 2) {
    errors.push("Product name must be at least 2 characters");
  }
  if (!input.description || input.description.length < 20) {
    errors.push("Description must be at least 20 characters");
  }
  if (!input.category) {
    errors.push("Product category is required");
  }
  if (errors.length > 0) {
    return { success: false, audiencePersona: "", positioningStatement: "", competitorAnalysis: "", report: "", errors };
  }

  // Update BSO with raw input
  store.update("product", {
    name: input.productName,
    description: input.description,
    category: input.category,
    audience: {
      demographics: input.audienceDemographics || "",
      psychographics: input.audiencePsychographics || "",
      techSophistication: "medium",
    },
    competitors: (input.competitorNames || []).map((name) => ({
      name,
      notes: "",
    })),
  } as Partial<ProductInfo>);

  const bso = store.get();

  // Build and execute discovery prompt
  const prompt = engine.build("discovery", bso, {
    inspirations: input.brandInspirations || "",
    keywords: (input.personalityKeywords || []).join(", "),
  });

  let analysisText: string;
  try {
    analysisText = await generateWithGemini(prompt, config, { temperature: 0.5, maxTokens: 4096 });
  } catch (err) {
    return {
      success: false,
      audiencePersona: "",
      positioningStatement: "",
      competitorAnalysis: "",
      report: "",
      errors: [`AI generation failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  // Parse AI output into structured sections
  const audiencePersona = extractSection(analysisText, "Audience Persona");
  const positioning = extractSection(analysisText, "Positioning") ||
    `For ${input.audienceDemographics || "users"} who need ${input.description.slice(0, 50)}, ${input.productName} is the ${input.category} that delivers exceptional value.`;
  const competitors = extractSection(analysisText, "Competitive");

  // Update BSO with generated analysis
  store.update("strategy", { positioning } as Partial<BrandStateObject["strategy"]>);
  store.update("product", {
    audience: {
      ...bso.product.audience,
      demographics: audiencePersona || bso.product.audience.demographics,
    },
  } as Partial<ProductInfo>);

  store.advanceStage(); // Stage 1 → 2

  const report = [
    `# Brand Discovery Report — ${input.productName}`,
    "",
    "## Audience Persona",
    audiencePersona || "Analysis pending...",
    "",
    "## Positioning Statement",
    positioning,
    "",
    "## Competitive Landscape",
    competitors || "No competitors analyzed.",
    "",
    "## Raw Analysis",
    analysisText,
  ].join("\n");

  return {
    success: true,
    audiencePersona: audiencePersona || "",
    positioningStatement: positioning,
    competitorAnalysis: competitors || "",
    report,
  };
}

/**
 * Run discovery from a YAML/JSON manifest
 */
export async function runDiscoveryFromManifest(manifest: {
  brand: {
    product_name: string;
    category: string;
    audience: { type: string; sophistication: string; age_range?: string };
    description?: string;
    competitors?: string[];
  };
}): Promise<DiscoveryOutput> {
  return runDiscovery({
    productName: manifest.brand.product_name,
    description: manifest.brand.description || "",
    category: manifest.brand.category,
    audienceDemographics: `${manifest.brand.audience.type}, sophistication: ${manifest.brand.audience.sophistication}${manifest.brand.audience.age_range ? `, age: ${manifest.brand.audience.age_range}` : ""}`,
    competitorNames: manifest.brand.competitors,
  });
}

// ─── Helpers ─────────────────────────────────────────────────

function extractSection(text: string, sectionName: string): string {
  // Try markdown headers
  const headerRegex = new RegExp(`#{1,3}\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n#{1,3}\\s|$)`, "i");
  const headerMatch = text.match(headerRegex);
  if (headerMatch) return headerMatch[1].trim();

  // Try numbered sections
  const numRegex = new RegExp(`\\d+\\.\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n\\d+\\.\\s|$)`, "i");
  const numMatch = text.match(numRegex);
  if (numMatch) return numMatch[1].trim();

  // Try bold markers
  const boldRegex = new RegExp(`\\*\\*${sectionName}[^*]*\\*\\*[^\\n]*\\n+([\\s\\S]*?)(?=\\n\\*\\*|$)`, "i");
  const boldMatch = text.match(boldRegex);
  if (boldMatch) return boldMatch[1].trim();

  return "";
}
