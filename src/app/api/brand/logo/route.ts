/**
 * VibeBranding Logo Generation API
 *
 * POST /api/brand/logo
 * Body: { brandName, description, primaryColour?, accentColour?, style? }
 *
 * Generates SVG logos via Gemini AI code generation.
 * Returns SVG data URI or graceful fallback.
 *
 * NOTE: The main pipeline generates logos via src/modules/logo/index.ts
 * using Gemini SVG code generation. This endpoint exists for standalone
 * logo generation outside the full pipeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBsoStore } from "@/core/bso";
import { generateWithGemini, getGeminiConfig } from "@/ai/gemini";

interface LogoRequest {
  brandName: string;
  description: string;
  primaryColour?: string;
  accentColour?: string;
  style?: "modern" | "playful" | "professional" | "minimal" | "bold";
}

const STYLE_GUIDE: Record<string, string> = {
  modern: "Clean geometric lines, flat vector, minimalist, sans-serif, contemporary",
  playful: "Organic rounded shapes, whimsical, friendly, approachable, soft curves",
  professional: "Precise symmetrical forms, corporate, sharp angles, authoritative, refined",
  minimal: "Ultra-minimalist, single-line art, negative space, elegant restraint, simple forms",
  bold: "Heavy thick lines, dynamic composition, high contrast, impactful, memorable",
};

function buildSvgPrompt(brandName: string, description: string, primary: string, accent: string, style: string): string {
  return `Generate a professional vector SVG logo for "${brandName}".
Description: ${description.slice(0, 200)}
Style: ${STYLE_GUIDE[style] || STYLE_GUIDE.modern}
Colour palette: ${primary} (primary), ${accent} (accent).

Requirements:
- Output ONLY valid SVG markup with <svg> root element
- NO markdown fences, NO explanations, NO text outside SVG
- viewBox="0 0 400 400"
- Use the given colours, white/transparent background
- Scalable, monochrome-friendly
- No text, no watermark, no photorealism
- Clean semantic SVG elements (paths, circles, rects)`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LogoRequest;

    if (!body.brandName || !body.description) {
      return NextResponse.json(
        { success: false, error: "brandName and description are required" },
        { status: 400 }
      );
    }

    const primary = body.primaryColour || "#2563EB";
    const accent = body.accentColour || "#F59E0B";
    const style = body.style || "modern";

    const svgPrompt = buildSvgPrompt(body.brandName, body.description, primary, accent, style);

    const config = getGeminiConfig();
    const svgContent = await generateWithGemini(svgPrompt, config, {
      temperature: 0.3,
      maxTokens: 2048,
    });

    // Extract SVG from response (strip markdown fences if present)
    const cleaned = svgContent
      .replace(/```svg\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    if (!cleaned.startsWith("<svg")) {
      return NextResponse.json({
        success: false,
        error: "AI response was not valid SVG markup",
        raw: cleaned.slice(0, 500),
      }, { status: 500 });
    }

    // Convert to data URI
    const base64 = Buffer.from(cleaned).toString("base64");
    const dataUri = `data:image/svg+xml;base64,${base64}`;

    // Store in BSO if available
    try {
      const store = getBsoStore();
      const bsoState = store.get();
      const existingLogo = bsoState.visualIdentity?.logo;
      if (existingLogo) {
        const existingConcepts = existingLogo.concepts || [];
        store.update("visualIdentity", {
          logo: {
            ...existingLogo,
            concepts: existingConcepts.concat({
              index: existingConcepts.length,
              description: `Gemini SVG — ${style} style`,
              prompt: svgPrompt,
              imageUrl: dataUri,
              rationale: `Generated via Gemini SVG code generation in "${style}" style`,
            }),
          },
        });
      }
    } catch {
      // Non-critical — BSO store may not be initialized
    }

    return NextResponse.json({
      success: true,
      urls: [dataUri],
      format: "svg",
      model: "gemini-3.1-flash-lite",
      prompt: svgPrompt,
    });
  } catch (err) {
    console.error("Logo generation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/brand/logo — return current logo state from BSO
 */
export async function GET() {
  try {
    const store = getBsoStore();
    const bso = store.get();
    const logo = bso.visualIdentity?.logo;
    return NextResponse.json({
      available: !!logo,
      logo: logo || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
