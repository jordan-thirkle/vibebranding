/**
 * Brand Export API — Dashboard
 *
 * POST /api/brands/[id]/export
 * Body: { format: "css" | "tailwind" | "scss" | "figma" | "html" | "all" }
 *
 * Loads a stored brand's BSO from the database and generates export files.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BrandStateObject } from "@/core/bso/types";
import { generateCSSFile } from "@/export/css-tokens";
import { generateTailwindFile } from "@/export/tailwind";
import { generateSCSSFile } from "@/export/scss";
import { generateFigmaFile } from "@/export/figma";
import { generateGuidelinesHTML } from "@/modules/guidelines/index";

type ExportFormat = "css" | "tailwind" | "scss" | "figma" | "html" | "all";
const ALLOWED_FORMATS: ExportFormat[] = ["css", "tailwind", "scss", "figma", "html", "all"];

async function getAuthClient() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, userId: user.id };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthClient();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse format
    const body = (await request.json()) as { format?: ExportFormat };
    const format = body.format || "all";
    if (!ALLOWED_FORMATS.includes(format)) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch brand from DB
    const { data: brand, error } = await auth.supabase
      .from("brands")
      .select("name, bso")
      .eq("id", id)
      .eq("user_id", auth.userId)
      .single();

    if (error || !brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    // Cast the stored JSON to the BSO type (trust Zod validation at write time)
    const bso = brand.bso as unknown as BrandStateObject;
    const visual = bso.visualIdentity;
    const colours = visual?.colourSystem;
    const typography = visual?.typography;
    const motion = visual?.motionLanguage;

    if (!colours) {
      return NextResponse.json(
        { success: false, error: "No brand identity data available. Run brand generation first." },
        { status: 400 }
      );
    }

    // Generate export files
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
      brandName: brand.name,
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
    console.error("Brand export error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
