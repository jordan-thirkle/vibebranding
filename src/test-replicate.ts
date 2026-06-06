// Test: Recraft V4.1 SVG logo generation via Replicate
// Run with: npx tsx src/test-replicate.ts

async function main() {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    console.error("❌ REPLICATE_API_KEY not set");
    process.exit(1);
  }

  console.log("🔑 Replicate API key found");
  console.log("🎨 Testing Recraft V4.1 SVG logo generation...\n");

  const prompt = "Flat vector logo of a geometric fox head made of connected triangles, minimal, professional, blue and amber colors, white background, clean edges, scalable, no text, no gradients";

  const body = {
    input: {
      prompt,
      negative_prompt: "photorealism, gradients, drop shadows, texture, decorative borders, text, watermark, 3d, complex, realistic",
      width: 1024,
      height: 1024,
      num_outputs: 2,
      output_format: "svg",
    },
  };

  try {
    // Create prediction
    console.log("📤 Sending to Recraft V4.1 SVG...");
    const createRes = await fetch(
      "https://api.replicate.com/v1/models/recraft-ai/recraft-v4.1-svg/predictions",
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

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error(`❌ Replicate API error (${createRes.status}):`, err);
      process.exit(1);
    }

    const prediction = await createRes.json() as {
      id: string;
      status: string;
      output?: string | string[];
      error?: string;
      logs?: string;
    };

    console.log("   ID:", prediction.id);
    console.log("   Status:", prediction.status);

    if (prediction.status === "failed" || prediction.error) {
      console.error("❌ Prediction failed:", prediction.error);
      process.exit(1);
    }

    if (prediction.output) {
      const outputs = Array.isArray(prediction.output) ? prediction.output : [prediction.output];
      console.log(`\n✅ Generated ${outputs.length} SVG(s):`);
      for (let i = 0; i < outputs.length; i++) {
        const url = outputs[i];
        console.log(`   [${i + 1}] ${url}`);

        // Try to fetch and show SVG size
        try {
          const svgRes = await fetch(url);
          const svgText = await svgRes.text();
          console.log(`       Size: ${svgText.length} chars, starts with: ${svgText.slice(0, 80)}...`);
        } catch {
          console.log("       (could not fetch SVG content)");
        }
      }
    } else {
      console.log("   ⏳ Prediction still processing...");
    }
  } catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
