/**
 * AI Fallback Router — provides resilience by trying Gemini first,
 * then falling back to Groq when Gemini quota/rate limits are exhausted.
 *
 * All branding modules should import from here instead of directly from "@/ai/gemini".
 * This ensures the pipeline keeps running even when Gemini is unavailable.
 *
 * Fallback chain:
 *   1. Gemini 3.1 Flash-Lite (free tier, high quota)
 *   2. Groq Llama 3.3 70B (free tier, 14,400 req/day, no credit card)
 */

import { generateWithGemini, getGeminiConfig, type GenerationOptions } from "./gemini";
import { generateWithGroq, getGroqConfig } from "./groq";

export type { GenerationOptions } from "./gemini";

/**
 * Generate text with automatic fallback.
 * Tries Gemini first, falls back to Groq on quota/rate-limit/network errors.
 *
 * @param prompt - The prompt to send
 * @param options - Generation options (temperature, maxTokens)
 * @returns Generated text string
 * @throws If both providers fail
 */
export async function generateText(
  prompt: string,
  options: GenerationOptions = {}
): Promise<string> {
  const firstErrors: string[] = [];

  // Try Gemini first
  try {
    const geminiConfig = getGeminiConfig();
    const text = await generateWithGemini(prompt, geminiConfig, options);
    return text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    firstErrors.push(`Gemini: ${msg}`);

    // Only fall back to Groq if it looks like a quota/rate-limit/network issue
    const isQuotaOrNetwork = /quota|rate limit|429|RESOURCE_EXHAUSTED|insufficient|timeout|network|fetch|ECONNREFUSED|SAFETY|blocked/i.test(msg);

    if (!isQuotaOrNetwork) {
      // Non-retryable error (bad prompt, auth error, etc.) — don't fall back
      throw err;
    }

    console.warn(`⚠️  Gemini failed (${msg}). Falling back to Groq...`);
  }

  // Fall back to Groq
  try {
    const groqConfig = getGroqConfig();
    if (groqConfig.apiKey) {
      const text = await generateWithGroq(prompt, groqConfig, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      return text;
    }
    firstErrors.push("Groq: GROQ_API_KEY not set");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    firstErrors.push(`Groq: ${msg}`);
  }

  // Both failed
  throw new Error(
    `All AI providers failed:\n${firstErrors.join("\n")}`
  );
}

/**
 * Generate structured JSON output with fallback.
 */
export async function generateStructured<T>(
  prompt: string,
  schema: string,
  options: GenerationOptions = {}
): Promise<T> {
  const fullPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema. Do not include markdown formatting or explanation:\n${schema}`;

  const raw = await generateText(fullPrompt, {
    ...options,
    temperature: Math.min(options.temperature ?? 0.3, 0.3),
  });

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(jsonStr) as T;
}
