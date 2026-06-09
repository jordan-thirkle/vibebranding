/**
 * Groq AI integration for VibeBranding.
 * Used as a secondary AI provider when Gemini quota is exhausted.
 *
 * Groq offers ultra-fast inference on open-source models with generous free tier:
 * - 30 RPM (requests per minute)
 * - 14,400 RPD (requests per day) — no credit card needed
 * - Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B, and more
 *
 * API is OpenAI-compatible: POST https://api.groq.com/openai/v1/chat/completions
 */

export interface GroqConfig {
  apiKey: string;
  model?: string;
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Generate text using Groq's API with exponential backoff retry.
 * Follows the same pattern as generateWithGemini for drop-in replacement.
 */
export async function generateWithGroq(
  prompt: string,
  config: GroqConfig,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const model = config.model || DEFAULT_MODEL;
  const apiKey = config.apiKey;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set — cannot use Groq fallback");
  }

  const body = {
    model,
    messages: [
      { role: "user", content: prompt },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
  };

  let lastError: Error | null = null;
  const maxRetries = 2;
  const baseDelayMs = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("Groq returned empty response");
        }

        return text.trim();
      }

      // Retry on rate limit or server errors
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * 2 ** attempt, 10000);
        console.warn(`⚠️  Groq API error (${response.status}) attempt ${attempt + 1}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        lastError = new Error(`Groq API error (${response.status})`);
        continue;
      }

      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (attempt < maxRetries) {
          const delay = Math.min(baseDelayMs * 2 ** attempt, 10000);
          console.warn(`⚠️  Groq request timed out attempt ${attempt + 1}. Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          lastError = new Error("Groq request timed out");
          continue;
        }
        throw new Error("Groq request timed out after all retries");
      }
      throw err;
    }
  }

  throw lastError || new Error("Groq generation failed after retries");
}

/**
 * Get Groq config from environment.
 */
export function getGroqConfig(): GroqConfig {
  const apiKey = process.env.GROQ_API_KEY || "";
  return {
    apiKey,
    model: DEFAULT_MODEL,
  };
}
