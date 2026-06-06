/**
 * VibeBranding Logo Generation API
 *
 * POST /api/brand/logo
 * Body: { brandName, description, primaryColour?, accentColour?, style? }
 *
 * Generates SVG logos using Recraft V4.1 via Replicate.
 * Returns SVG URL or graceful fallback if Replicate credit is insufficient.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateVectorWithRecraft } from "@/ai/model-router";
import { getBsoStore } from "@/core/bso";

interface LogoRequest {
  brandName: string;
  description: string;
  primaryColour?: string;
  accentColour?: string;
  style?: "modern" | "playful" | "professional" | "minimal" | "bold";
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

    // Build a rich SVG prompt for Recraft
    const styleGuide: Record<string, string> = {
      modern: "Clean geometric lines, flat vector, minimalist, sans-serif, contemporary",
      playful: "Organic rounded shapes, whimsical, friendly, approachable, soft curves",
      professional: "Precise symmetrical forms, corporate, sharp angles, authoritative, refined",
      minimal: "Ultra-minimalist, single-line art, negative space, elegant restraint, simple forms",
      bold: "Heavy thick lines, dynamic composition, high contrast, impactful, memorable",
    };

    const styleDesc = styleGuide[style] || styleGuide.modern;

    const svgPrompt = [
      `Professional vector logo for "${body.brandName}".`,
      `${body.description.slice(0, 200)}`,
      `Style: ${styleDesc}.`,
      `Colour palette: ${primary} (primary), ${accent} (accent).`,
      "White or transparent background. Scalable, monochrome-friendly. No text, no watermark, no photorealism.",
    ].join(" ");

    const result = await generateVectorWithRecraft(svgPrompt, "standard");

    if (result.status === "success") {
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
              concepts: existingConcepts.concat(
                result.urls.map((url, i) => ({
                  index: existingConcepts.length + i,
                  description: `Recraft SVG — ${style} style`,
                  prompt: svgPrompt,
                  imageUrl: url,
                  rationale: `Generated via Recraft V4.1 SVG in "${style}" style`,
                }))
              ),
            },
          });
        }
      } catch {
        // Non-critical — BSO store may not be initialized
      }

      return NextResponse.json({
        success: true,
        urls: result.urls,
        format: "svg",
        model: result.model,
        prompt: svgPrompt,
      });
    }

    // Graceful fallback for no_credit or error
    return NextResponse.json({
      success: false,
      status: result.status,
      error: result.errorMessage || "Logo generation unavailable",
      note: result.status === "no_credit"
        ? "Add billing to your Replicate account at https://replicate.com/account/billing to enable SVG logo generation."
        : undefined,
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
