/**
 * VibeBranding Export API
 *
 * POST /api/brand/export
 * Body: { format: "css" | "tailwind" | "scss" | "figma" | "html" | "zip" | "all" }
 *
 * Returns generated export files for the current brand state.
 * Use the `download=true` query param to get a single file directly.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBsoStore } from "@/core/bso";
import { generateCSSFile } from "@/export/css-tokens";
import { generateTailwindFile } from "@/export/tailwind";
import { generateSCSSFile } from "@/export/scss";
import { generateFigmaFile } from "@/export/figma";
import { generateGuidelinesHTML } from "@/modules/guidelines/index";

type ExportFormat = "css" | "tailwind" | "scss" | "figma" | "html" | "all";

const ALLOWED_FORMATS: ExportFormat[] = ["css", "tailwind", "scss", "figma", "html", "all"];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { format?: ExportFormat };
    const format = body.format || "all";

    if (!ALLOWED_FORMATS.includes(format)) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    const store = getBsoStore();
    const bso = store.get();
    const colours = bso.visualIdentity.colourSystem;
    const typography = bso.visualIdentity.typography;
    const motion = bso.visualIdentity.motionLanguage;

    if (!colours) {
      return NextResponse.json(
        { success: false, error: "No brand data available. Run brand generation first." },
        { status: 400 }
      );
    }

    const files: Record<string, { filename: string; content: string; contentType: string }> = {};

    if (format === "css" || format === "all") {
      const cssFile = generateCSSFile(colours, typography, motion);
      files.css = { ...cssFile, contentType: "text/css" };
    }

    if (format === "tailwind" || format === "all") {
      const twFile = generateTailwindFile(colours, typography);
      files.tailwind = { ...twFile, contentType: "application/javascript" };
    }

    if (format === "scss" || format === "all") {
      const scssFile = generateSCSSFile(colours, typography, motion);
      files.scss = { ...scssFile, contentType: "text/x-scss" };
    }

    if (format === "figma" || format === "all") {
      const figmaFile = generateFigmaFile(colours, typography);
      files.figma = { ...figmaFile, contentType: "application/json" };
    }

    if (format === "html" || format === "all") {
      files.html = {
        filename: "brand-guidelines.html",
        content: generateGuidelinesHTML(),
        contentType: "text/html",
      };
    }

    return NextResponse.json({
      success: true,
      brandName: bso.product.name,
      exportDate: new Date().toISOString(),
      files: Object.fromEntries(
        Object.entries(files).map(([key, info]) => [
          key,
          { filename: info.filename, contentType: info.contentType, content: info.content },
        ])
      ),
      fileCount: Object.keys(files).length,
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
