// AI Integration Layer — barrel export (updated June 2026)
export { generateWithGemini, generateStructuredWithGemini, getGeminiConfig } from "./gemini";
export type { GeminiConfig, GenerationOptions } from "./gemini";

export {
  getTaskConfig,
  registerTaskModel,
  generateImageWithReplicate,
  generateWithNanoBanana,
  generateVectorWithRecraft,
  MODEL_PRICING,
} from "./model-router";

export type {
  AIProvider,
  AITask,
  ModelConfig,
  ImageGenerationInput,
  ImageGenerationOutput,
} from "./model-router";
