import type { BrandStateObject } from "@/core/bso/types";

/**
 * Prompt Template — a tagged template literal function that allows
 * variable interpolation from a BSO context.
 */
export type PromptTemplate = (context: PromptContext) => string;

export interface PromptContext {
  bso: Readonly<BrandStateObject>;
  stage: number;
  module: string;
  additionalContext?: Record<string, string>;
}

/**
 * Prompt Engine — constructs structured branding prompts using
 * contextual chaining from the accumulated BSO.
 *
 * Each module prompt receives the full BSO as context, ensuring
 * every downstream decision is coherent with upstream decisions.
 */
export class PromptEngine {
  private templates: Map<string, PromptTemplate> = new Map();

  /** Register a prompt template for a module */
  register(module: string, template: PromptTemplate): void {
    this.templates.set(module, template);
  }

  /** Build a prompt for a specific module with full BSO context */
  build(module: string, bso: Readonly<BrandStateObject>, additionalContext?: Record<string, string>): string {
    const template = this.templates.get(module);
    if (!template) {
      throw new Error(`No prompt template registered for module: ${module}`);
    }

    const stage = getModuleStage(module);
    const stageContext = getStageContextSummary(bso, stage);

    const ctx: PromptContext = {
      bso,
      stage,
      module,
      additionalContext,
    };

    const prompt = template(ctx);

    // Prepend the stage context as system-level instructions
    return `${stageContext}\n\n${prompt}`;
  }

  /** Build a prompt with ONLY the stage context (for validation gates) */
  buildValidationPrompt(bso: Readonly<BrandStateObject>): string {
    const stage = bso.metadata.stage;
    const stageContext = getStageContextSummary(bso, stage);

    return `VALIDATION GATE — Stage ${stage}\n\n${stageContext}\n\nCheck the Brand State Object above for coherence and consistency.`;
  }
}

// ─── Stage Context ───────────────────────────────────────────

function getStageContextSummary(bso: Readonly<BrandStateObject>, stage: number): string {
  const parts: string[] = [];

  parts.push(`## Current Brand State (Stage ${stage}/9)\n`);

  if (bso.product.name) {
    parts.push(`### Product\n- Name: ${bso.product.name}\n- Category: ${bso.product.category}\n- Description: ${bso.product.description}\n- Target Audience: ${bso.product.audience.demographics}`);
  }

  if (stage >= 2 && bso.strategy.positioning) {
    parts.push(`### Strategy\n- Positioning: ${bso.strategy.positioning}\n- Archetypes: ${bso.strategy.personalityArchetypes.map(a => `${a.archetype} (${a.weight}%)`).join(", ")}\n- Emotional Territory: ${bso.strategy.emotionalTerritory}\n- Values: ${bso.strategy.brandValues.join(", ")}`);
  }

  if (stage >= 3 && bso.verbalIdentity.naming?.recommended !== undefined) {
    const name = bso.verbalIdentity.naming.candidates?.[bso.verbalIdentity.naming.recommended];
    parts.push(`### Naming\n- Selected: ${name?.name || "Pending"}`);
  }

  if (stage >= 4 && bso.visualIdentity.colourSystem) {
    const cs = bso.visualIdentity.colourSystem;
    parts.push(`### Colour System\n- Primary: ${cs.primaryColour}\n- Harmony: ${cs.harmonyType}\n- WCAG: ${cs.wcagReport.overall}`);
  }

  if (stage >= 4 && bso.visualIdentity.typography) {
    const t = bso.visualIdentity.typography;
    parts.push(`### Typography\n- Display: ${t.displayFont.name}\n- Text: ${t.textFont.name}`);
  }

  parts.push(`\n---\nUse the context above to inform the next generation. Ensure all new outputs are coherent with established decisions.`);

  return parts.join("\n");
}

function getModuleStage(module: string): number {
  const stageMap: Record<string, number> = {
    discovery: 1,
    strategy: 2,
    naming: 3,
    color: 4,
    typography: 4,
    logo: 5,
    iconography: 5,
    illustration: 5,
    motion: 5,
    copywriting: 6,
    applications: 7,
    guidelines: 8,
    export: 9,
    consistency: -1,
  };
  return stageMap[module] || 1;
}

// ─── Singleton ───────────────────────────────────────────────

let engineInstance: PromptEngine | null = null;

export function getPromptEngine(): PromptEngine {
  if (!engineInstance) {
    engineInstance = new PromptEngine();
  }
  return engineInstance;
}

// Re-export from templates for convenience
export { registerAllTemplates } from "./templates";
