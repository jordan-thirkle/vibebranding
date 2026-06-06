/**
 * Iconography Module (Stage 5)
 *
 * Generates a cohesive icon system:
 * - Style parameters (stroke weight, corner radius, fill approach)
 * - 24 core UI icons
 * - 12 feature/product-specific icons
 * - App icon / favicon at all sizes
 */

import { getBsoStore } from "@/core/bso";
import type { IconographyInfo, IconSpec, AppIconSpec, VisualIdentityInfo } from "@/core/bso/types";

export interface IconographyOutput {
  success: boolean;
  strokeWeight: number;
  cornerRadius: number;
  fillApproach: string;
  coreIconCount: number;
  featureIconCount: number;
}

/**
 * Generate icon system based on brand archetype and personality.
 * Uses deterministic rules (no AI call needed — derived from strategy).
 */
export function runIconography(): IconographyOutput {
  const store = getBsoStore();
  const bso = store.get();

  if (!bso.strategy.personalityArchetypes.length) {
    return { success: false, strokeWeight: 0, cornerRadius: 0, fillApproach: "", coreIconCount: 0, featureIconCount: 0 };
  }

  const archetypes = bso.strategy.personalityArchetypes.map((a) => a.archetype);
  const spectrum = bso.strategy.personalitySpectrum;

  // ── Determine Style Parameters ───────────────────────
  const isPlayful = archetypes.some((a) => ["Jester", "Creator", "Explorer"].includes(a));
  const isAuthoritative = archetypes.some((a) => ["Sage", "Ruler"].includes(a));
  const isBold = spectrum.boldVsUnderstated > 60;

  const strokeWeight = isBold || isPlayful ? 2.5 : isAuthoritative ? 1.5 : 2.0;
  const cornerRadius = isPlayful ? 4 : isAuthoritative ? 1 : 2;
  const fillApproach: IconographyInfo["fillApproach"] = isBold ? "filled" : "outline";

  // ── Core UI Icons (24) ──────────────────────────────
  const coreIcons: IconSpec[] = [
    // Navigation
    { name: "home", category: "navigation", description: "House shape, clean lines" },
    { name: "search", category: "navigation", description: "Magnifying glass, circular handle" },
    { name: "settings", category: "navigation", description: "Gear/cog shape, 6-8 teeth" },
    { name: "menu", category: "navigation", description: "Three horizontal lines (hamburger)" },
    { name: "close", category: "navigation", description: "X mark, 45° crossed lines" },
    { name: "arrow-left", category: "navigation", description: "Left-pointing chevron/arrow" },
    { name: "arrow-right", category: "navigation", description: "Right-pointing chevron/arrow" },
    { name: "arrow-up", category: "navigation", description: "Upward-pointing chevron" },
    // Actions
    { name: "plus", category: "action", description: "Plus sign, equal cross arms" },
    { name: "minus", category: "action", description: "Minus sign, horizontal line" },
    { name: "trash", category: "action", description: "Waste bin with lid" },
    { name: "edit", category: "action", description: "Pencil at 45° angle" },
    { name: "save", category: "action", description: "Floppy disk / download tray" },
    { name: "share", category: "action", description: "Three connected nodes/circles" },
    { name: "download", category: "action", description: "Down arrow with tray" },
    { name: "upload", category: "action", description: "Up arrow with tray" },
    { name: "refresh", category: "action", description: "Circular arrows forming loop" },
    { name: "copy", category: "action", description: "Two overlapping documents" },
    // Status
    { name: "check", category: "status", description: "Checkmark, smooth curve" },
    { name: "alert", category: "status", description: "Triangle with exclamation mark" },
    { name: "info", category: "status", description: "Circle with 'i' inside" },
    { name: "lock", category: "status", description: "Padlock shape, closed shackle" },
    { name: "clock", category: "status", description: "Clock face with hands" },
    { name: "user", category: "status", description: "Person silhouette, head + shoulders" },
  ];

  // ── Feature Icons (12) ──────────────────────────────
  const category = bso.product.category?.toLowerCase() || "";
  const isDevTool = category.includes("developer") || category.includes("tool") || category.includes("code");
  const isDesign = category.includes("design") || category.includes("creative");
  const isSaaS = category.includes("saas") || category.includes("platform");

  const featureIcons: IconSpec[] = [];
  if (isDevTool) {
    featureIcons.push(
      { name: "code", category: "feature", description: "Angle brackets </>" },
      { name: "terminal", category: "feature", description: "Command prompt symbol >_" },
      { name: "database", category: "feature", description: "Stacked cylinders" },
      { name: "git-branch", category: "feature", description: "Branching path with circles" }
    );
  }
  if (isDesign) {
    featureIcons.push(
      { name: "palette", category: "feature", description: "Artist palette with colour blobs" },
      { name: "layers", category: "feature", description: "Stacked squares, offset" },
      { name: "grid", category: "feature", description: "3x3 grid of squares" },
      { name: "pen-tool", category: "feature", description: "Fountain pen nib" }
    );
  }
  if (isSaaS || (!isDevTool && !isDesign)) {
    featureIcons.push(
      { name: "dashboard", category: "feature", description: "Grid with highlighted cell" },
      { name: "chart", category: "feature", description: "Bar chart, ascending bars" },
      { name: "users", category: "feature", description: "Two overlapping person silhouettes" },
      { name: "cloud", category: "feature", description: "Cloud shape" }
    );
  }
  // Universal feature icons
  const universal: IconSpec[] = [
    { name: "star", category: "feature", description: "Five-pointed star" },
    { name: "heart", category: "feature", description: "Heart shape" },
    { name: "bell", category: "feature", description: "Notification bell" },
    { name: "envelope", category: "feature", description: "Mail envelope" },
  ];
  // Fill up to 12
  while (featureIcons.length < 12) {
    const next = universal[featureIcons.length % universal.length];
    if (!featureIcons.find((f) => f.name === next.name)) {
      featureIcons.push(next);
    } else {
      break;
    }
  }

  // ── App Icon ────────────────────────────────────────
  const appIcon: AppIconSpec = {
    description: `${bso.product.name} app icon — ${fillApproach} style with ${bso.visualIdentity.colourSystem?.primaryColour || "brand primary"} background and white mark`,
    sizes: [16, 32, 64, 128, 180, 192, 512],
    platformAdaptations: "iOS: rounded corners (20% radius). Android: adaptive icon with foreground + background layers. PWA: maskable icon with 40px safe zone.",
  };

  // ── Update BSO ──────────────────────────────────────
  const iconography: IconographyInfo = {
    strokeWeight,
    cornerRadius,
    fillApproach,
    viewBox: 24,
    coreIcons,
    featureIcons,
    appIcon,
  };

  store.update("visualIdentity", { iconography } as Partial<VisualIdentityInfo>);

  return {
    success: true,
    strokeWeight,
    cornerRadius,
    fillApproach,
    coreIconCount: coreIcons.length,
    featureIconCount: featureIcons.length,
  };
}
