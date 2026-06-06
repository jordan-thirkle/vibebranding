/**
 * Google Gemini AI integration for VibeBranding.
 * Handles text generation for strategy, naming, copywriting, and image generation.
 * Features exponential backoff retry for rate limits and transient failures.
 */

export interface GeminiConfig {
  apiKey: string;
  model?: string; // e.g. "gemini-2.5-pro", "gemini-2.5-flash"
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelayMs?: number;
  /** Maximum delay in ms (default: 30000) */
  maxDelayMs?: number;
}

const DEFAULT_MODEL = "gemini-3.5-flash";
const DEFAULT_RETRY: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

/** HTTP status codes that are safe to retry */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

/**
 * Calculate delay with exponential backoff and full jitter.
 * Returns a random value between 0 and `cap` where cap grows exponentially.
 */
function calculateBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponent = Math.min(attempt, 10); // cap exponent growth
  const cap = Math.min(baseDelayMs * 2 ** exponent, maxDelayMs);
  return Math.random() * cap;
}

/**
 * Sleep for the given duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate text using Google Gemini API with automatic retry on failure.
 * This is the primary AI interface for all branding modules.
 *
 * Retry behavior:
 * - 429 (rate limit / quota): retries with exponential backoff + jitter
 * - 5xx (server errors): retries with exponential backoff + jitter
 * - Network/fetch errors: retries with exponential backoff + jitter
 * - Empty response: NO retry (indicates model issue, not transient)
 * - 4xx (other): NO retry (client errors won't resolve)
 */
export async function generateWithGemini(
  prompt: string,
  config: GeminiConfig,
  options: GenerationOptions = {},
  retryOptions: RetryOptions = {}
): Promise<string> {
  const model = config.model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY, ...retryOptions };

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
      topP: options.topP ?? 0.95,
    },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Gemini returned empty response");
        }

        return text;
      }

      // Non-OK status
      const errorText = await response.text();

      if (RETRYABLE_STATUSES.has(response.status) && attempt < maxRetries) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
        const waitSeconds = (delay / 1000).toFixed(1);
        console.warn(`⚠️  Gemini API error (${response.status}) on attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${waitSeconds}s...`);
        await sleep(delay);
        lastError = new Error(`Gemini API error (${response.status}): ${errorText}`);
        continue;
      }

      // Non-retryable status or last attempt
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    } catch (err) {
      // Handle AbortError (timeout) as retryable
      if (err instanceof DOMException && err.name === "AbortError") {
        if (attempt < maxRetries) {
          const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
          const waitSeconds = (delay / 1000).toFixed(1);
          console.warn(`⚠️  Gemini request timed out on attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${waitSeconds}s...`);
          await sleep(delay);
          lastError = new Error("Gemini request timed out");
          continue;
        }
        throw new Error("Gemini request timed out after all retries");
      }

      // Re-throw non-retryable or last-attempt errors
      if (attempt < maxRetries && err instanceof Error) {
        // Network errors (TypeError from fetch) are retryable
        if (err.message?.includes("fetch") || err.message?.includes("network") || err.message?.includes("ECONNREFUSED")) {
          const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs);
          const waitSeconds = (delay / 1000).toFixed(1);
          console.warn(`⚠️  Gemini network error on attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${waitSeconds}s...`);
          await sleep(delay);
          lastError = err;
          continue;
        }
        throw err;
      }

      throw err;
    }
  }

  throw lastError || new Error("Gemini generation failed after retries");
}

/**
 * Generate structured JSON output from Gemini.
 * Uses a system prompt to enforce JSON output format.
 */
export async function generateStructuredWithGemini<T>(
  prompt: string,
  schema: string,
  config: GeminiConfig,
  options: GenerationOptions = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const fullPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema. Do not include markdown formatting or explanation:\n${schema}`;

  const raw = await generateWithGemini(fullPrompt, config, {
    ...options,
    temperature: Math.min(options.temperature ?? 0.3, 0.3),
  }, retryOptions);

  // Strip any markdown code fences if present
  const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(jsonStr) as T;
}

/**
 * Retrieve the Gemini API key from environment.
 * Uses GEMINI_API_KEY env var, or falls back to a hardcoded key for development.
 */
export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set — AI generation will fail.");
  }
  return {
    apiKey,
    model: "gemini-3.5-flash",
  };
}
