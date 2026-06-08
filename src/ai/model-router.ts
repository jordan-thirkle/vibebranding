/**
 * Model Router — updated for June 2026 model landscape.
 *
 * Routes branding tasks to the optimal AI model based on:
 * - Task type (strategy, naming, logo, illustration, etc.)
 * - Output format (text, raster image, SVG vector)
 * - Cost-efficiency (fast/cheap models for high-volume tasks)
 *
 * Providers:
 * - Google Gemini 3.5 Flash / 2.5 Pro (text)
 * - Recraft V4.1 SVG (vector logos, icons) ⭐
 * - Recraft V4.1 (design illustrations)
 * - Ideogram V4 (text-heavy graphic design)
 * - FLUX.2 Pro (high-quality illustration)
 * - Nano Banana 2 (fast/cheap image gen)
 */

// ─── Provider Types ──────────────────────────────────────────

export type AIProvider = "gemini" | "recraft" | "ideogram" | "flux" | "nano_banana" | "gpt_image";

export type AITask =
  | "strategy"
  | "naming"
  | "copywriting"
  | "colour_theory"
  | "typography"
  | "logo_concept"
  | "logo_refinement"
  | "logo_vector" // ⭐ SVG output via Recraft
  | "icon_vector" // ⭐ SVG output via Recraft
  | "illustration_abstract"
  | "illustration_character"
  | "illustration_3d"
  | "mood_board"
  | "motion_tokens"
  | "brand_validation"
  | "app_icon";

export interface ModelConfig {
  provider: AIProvider;
  modelId: string;
  temperature: number;
  maxTokens: number;
  outputType: "text" | "image_raster" | "image_svg";
  costTier: "free" | "budget" | "standard" | "premium";
  /** Replicate model identifier (if hosted on Replicate) */
  replicateModel?: string;
}

// ─── Task → Model Mapping (June 2026) ────────────────────────

const taskModelMap: Record<AITask, ModelConfig> = {
  // Text generation tasks → Gemini
  strategy: {
    provider: "gemini",
    modelId: "gemini-2.5-pro",
    temperature: 0.5,
    maxTokens: 8192,
    outputType: "text",
    costTier: "standard",
  },
  naming: {
    provider: "gemini",
    modelId: "gemini-2.5-pro",
    temperature: 0.8,
    maxTokens: 4096,
    outputType: "text",
    costTier: "standard",
  },
  copywriting: {
    provider: "gemini",
    modelId: "gemini-2.5-pro",
    temperature: 0.7,
    maxTokens: 8192,
    outputType: "text",
    costTier: "standard",
  },
  colour_theory: {
    provider: "gemini",
    modelId: "gemini-3.5-flash",
    temperature: 0.2,
    maxTokens: 2048,
    outputType: "text",
    costTier: "budget",
  },
  typography: {
    provider: "gemini",
    modelId: "gemini-3.5-flash",
    temperature: 0.2,
    maxTokens: 2048,
    outputType: "text",
    costTier: "budget",
  },
  motion_tokens: {
    provider: "gemini",
    modelId: "gemini-3.5-flash",
    temperature: 0.3,
    maxTokens: 2048,
    outputType: "text",
    costTier: "budget",
  },
  brand_validation: {
    provider: "gemini",
    modelId: "gemini-3.5-flash",
    temperature: 0.1,
    maxTokens: 4096,
    outputType: "text",
    costTier: "budget",
  },

  // Logo & Icon tasks → Recraft SVG ⭐
  logo_vector: {
    provider: "recraft",
    modelId: "recraft-v4.1-svg",
    temperature: 0.3,
    maxTokens: 2048,
    outputType: "image_svg",
    costTier: "standard",
    replicateModel: "recraft-ai/recraft-v4.1-svg",
  },
  icon_vector: {
    provider: "recraft",
    modelId: "recraft-v4.1-svg",
    temperature: 0.2,
    maxTokens: 2048,
    outputType: "image_svg",
    costTier: "standard",
    replicateModel: "recraft-ai/recraft-v4.1-svg",
  },
  app_icon: {
    provider: "recraft",
    modelId: "recraft-v4.1-pro-svg",
    temperature: 0.3,
    maxTokens: 2048,
    outputType: "image_svg",
    costTier: "premium",
    replicateModel: "recraft-ai/recraft-v4.1-pro-svg",
  },

  // Logo concepts → Recraft (design taste) or Ideogram (text rendering)
  logo_concept: {
    provider: "recraft",
    modelId: "recraft-v4.1",
    temperature: 0.6,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "standard",
    replicateModel: "recraft-ai/recraft-v4.1",
  },
  logo_refinement: {
    provider: "ideogram",
    modelId: "ideogram-v4-balanced",
    temperature: 0.3,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "standard",
    replicateModel: "ideogram-ai/ideogram-v4-balanced",
  },

  // Illustration tasks
  illustration_abstract: {
    provider: "recraft",
    modelId: "recraft-v4.1",
    temperature: 0.5,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "standard",
    replicateModel: "recraft-ai/recraft-v4.1",
  },
  illustration_character: {
    provider: "flux",
    modelId: "flux-2-pro",
    temperature: 0.6,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "premium",
    replicateModel: "black-forest-labs/flux-2-pro",
  },
  illustration_3d: {
    provider: "flux",
    modelId: "flux-2-pro",
    temperature: 0.5,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "premium",
    replicateModel: "black-forest-labs/flux-2-pro",
  },
  mood_board: {
    provider: "flux",
    modelId: "flux-2-pro",
    temperature: 0.7,
    maxTokens: 2048,
    outputType: "image_raster",
    costTier: "premium",
    replicateModel: "black-forest-labs/flux-2-pro",
  },
};

// ─── Image Generation via Replicate ──────────────────────────

export interface ImageGenerationInput {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  style?: string; // "vector", "illustration", "photorealistic", etc.
}

export interface ImageGenerationOutput {
  urls: string[];
  format: "svg" | "png" | "webp";
  model: string;
  cost?: number;
  status: "success" | "no_credit" | "error";
  errorMessage?: string;
}

/**
 * Generate images using Replicate's API.
 * Supports Recraft (SVG + raster), Ideogram, FLUX, and Nano Banana.
 */
export async function generateImageWithReplicate(
  modelConfig: ModelConfig,
  input: ImageGenerationInput
): Promise<ImageGenerationOutput> {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error("REPLICATE_API_KEY not set — cannot generate images");
  }

  const modelPath = modelConfig.replicateModel;
  if (!modelPath) {
    throw new Error(`No Replicate model configured for ${modelConfig.provider}/${modelConfig.modelId}`);
  }

  const isSvg = modelConfig.outputType === "image_svg";

  const body: Record<string, unknown> = {
    input: {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || "photorealistic, gradients, drop shadows, decorative borders, text, watermark",
      width: input.width || (isSvg ? 1024 : 1024),
      height: input.height || (isSvg ? 1024 : 1024),
      num_outputs: input.numOutputs || 1,
    },
  };

  // Recraft SVG-specific parameters
  if (modelConfig.provider === "recraft" && isSvg) {
    (body.input as Record<string, unknown>).style = "vector";
    (body.input as Record<string, unknown>).output_format = "svg";
  }

  // Create prediction
  const response = await fetch(
    `https://api.replicate.com/v1/models/${modelPath}/predictions`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    // 402 = insufficient credit — don't throw, return gracefully
    if (response.status === 402) {
      console.warn(`⚠️  Replicate: insufficient credit for ${modelPath}. Add billing at https://replicate.com/account/billing`);
      return {
        urls: [],
        format: isSvg ? "svg" : "png",
        model: modelPath,
        status: "no_credit",
        errorMessage: "Insufficient Replicate credit. Image generation skipped. Add billing to enable.",
      };
    }
    throw new Error(`Replicate API error (${response.status}): ${errorText}`);
  }

  const prediction = (await response.json()) as {
    id: string;
    status: string;
    output?: string | string[];
    error?: string;
  };

  if (prediction.status === "failed" || prediction.error) {
    return {
      urls: [],
      format: isSvg ? "svg" : "png",
      model: modelPath,
      status: "error",
      errorMessage: prediction.error || "Generation failed",
    };
  }

  const output = prediction.output;
  const urls = Array.isArray(output) ? output : [output].filter(Boolean) as string[];

  return {
    urls,
    format: isSvg ? "svg" : "png",
    model: modelPath,
    status: "success" as const,
  };
}

/**
 * Generate images using Google's Nano Banana 2 (fastest + free tier).
 * Falls back gracefully if Replicate has no credits.
 */
export async function generateWithNanoBanana(
  prompt: string,
  count: number = 1
): Promise<ImageGenerationOutput> {
  return generateImageWithReplicate(
    {
      provider: "nano_banana",
      modelId: "nano-banana-2",
      temperature: 0.7,
      maxTokens: 1024,
      outputType: "image_raster",
      costTier: "free",
      replicateModel: "google/nano-banana-2",
    },
    { prompt, numOutputs: count }
  );
}

/**
 * Generate SVG vector graphics (logos, icons) using Recraft.
 * Falls back gracefully if Replicate has no credits.
 */
export async function generateVectorWithRecraft(
  prompt: string,
  quality: "standard" | "pro" = "standard"
): Promise<ImageGenerationOutput> {
  const modelId = quality === "pro"
    ? "recraft-ai/recraft-v4.1-pro-svg"
    : "recraft-ai/recraft-v4.1-svg";

  return generateImageWithReplicate(
    {
      provider: "recraft",
      modelId: quality === "pro" ? "recraft-v4.1-pro-svg" : "recraft-v4.1-svg",
      temperature: 0.3,
      maxTokens: 2048,
      outputType: "image_svg",
      costTier: quality === "pro" ? "premium" : "standard",
      replicateModel: modelId,
    },
    {
      prompt,
      width: 1024,
      height: 1024,
      negativePrompt: "photorealism, gradients, drop shadows, texture, decorative borders, text, watermark, 3d, complex",
    }
  );
}

// ─── Router ──────────────────────────────────────────────────

export function getTaskConfig(task: AITask): ModelConfig {
  return taskModelMap[task];
}

export function registerTaskModel(task: AITask, config: ModelConfig): void {
  taskModelMap[task] = config;
}

// ─── Cost Estimates (per 1K tokens or per image) ─────────────

export const MODEL_PRICING = {
  "gemini-3.5-flash": { input: "$0.075/1M tokens", output: "$0.30/1M tokens", tier: "budget" },
  "gemini-2.5-pro": { input: "$1.25/1M tokens", output: "$5.00/1M tokens", tier: "standard" },
  "recraft-ai/recraft-v4.1": { perImage: "~$0.03", tier: "budget" },
  "recraft-ai/recraft-v4.1-svg": { perImage: "~$0.05", tier: "standard" },
  "recraft-ai/recraft-v4.1-pro-svg": { perImage: "~$0.08", tier: "premium" },
  "ideogram-ai/ideogram-v4-balanced": { perImage: "~$0.04", tier: "standard" },
  "black-forest-labs/flux-2-pro": { perImage: "~$0.06", tier: "premium" },
  "google/nano-banana-2": { perImage: "FREE (limited)", tier: "free" },
} as const;
