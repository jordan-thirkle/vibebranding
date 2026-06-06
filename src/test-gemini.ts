// Quick test: Gemini API integration for VibeBranding
// Run with: npx tsx src/test-gemini.ts

import { generateWithGemini, getGeminiConfig } from "./ai/gemini";

async function main() {
  const config = getGeminiConfig();
  console.log("Testing Gemini API...");
  console.log("Model:", config.model);

  const prompt = `You are a brand strategist. In 3 bullet points, describe the brand strategy for a new AI-powered design tool called "PixelForge". Include archetype, emotional territory, and one value.`;

  try {
    const result = await generateWithGemini(prompt, config, {
      temperature: 0.5,
      maxTokens: 500,
    });

    console.log("\n✅ Gemini API works!");
    console.log("Response:", result);
  } catch (err) {
    console.error("❌ Gemini API failed:", err);
  }
}

main();
