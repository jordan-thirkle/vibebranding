/**
 * Brand Applications Module (Stage 7)
 *
 * Generates specifications for brand assets across all contexts:
 * - Digital: landing hero, app icons, OG cards, email headers, splash screens
 * - Marketing: social banners, Product Hunt assets, app store screenshots
 * - In-Product: onboarding, empty states, error pages, notifications
 */

import { getBsoStore } from "@/core/bso";
import type { AssetInfo, GeneratedAsset, VisualIdentityInfo } from "@/core/bso/types";

export interface ApplicationSpec {
  name: string;
  category: "digital" | "marketing" | "in_product";
  description: string;
  dimensions: string;
  format: string;
  designNotes: string;
}

export interface ApplicationsOutput {
  success: boolean;
  digital: ApplicationSpec[];
  marketing: ApplicationSpec[];
  inProduct: ApplicationSpec[];
  totalAssets: number;
}

/**
 * Generate all brand application specifications.
 * Deterministic — all derived from BSO without AI calls.
 */
export function runApplications(): ApplicationsOutput {
  const store = getBsoStore();
  const bso = store.get();
  const p = bso.product;
  const cs = bso.visualIdentity.colourSystem;
  const tp = bso.visualIdentity.typography;
  const logo = bso.visualIdentity.logo;

  const primary = cs?.primaryColour || "#2563EB";
  const accent = cs?.accentColour || "#F59E0B";
  const displayFont = tp?.displayFont.name || "DM Sans";
  const textFont = tp?.textFont.name || "Source Sans 3";

  // ── Digital Applications ─────────────────────────────
  const digital: ApplicationSpec[] = [
    {
      name: "Landing Page Hero",
      category: "digital",
      description: `Full-viewport hero section with ${p.name} branding`,
      dimensions: "1440×900px",
      format: "HTML/CSS or Figma frame",
      designNotes: `${primary} gradient background. ${displayFont} headline: "${p.name}". ${textFont} subheadline. Large CTA button in ${accent}. Logo mark top-left.`,
    },
    {
      name: "App Icon Set",
      category: "digital",
      description: "Full platform app icon set",
      dimensions: "16, 32, 64, 128, 180, 192, 512px",
      format: "PNG (transparent for some sizes)",
      designNotes: `${primary} rounded square background. White icon mark centered. ${displayFont} single-letter variant for small sizes.`,
    },
    {
      name: "Open Graph / Social Preview",
      category: "digital",
      description: "OG card for link sharing",
      dimensions: "1200×630px",
      format: "PNG",
      designNotes: `${primary} background with subtle geometric pattern. ${p.name} in white ${displayFont}, centered. Tagline below in ${textFont}.`,
    },
    {
      name: "Email Header",
      category: "digital",
      description: "Branded email template header",
      dimensions: "600×200px",
      format: "HTML + PNG fallback",
      designNotes: `Logo left-aligned. ${primary} accent line at top. ${p.name} in ${displayFont}. Clean white background.`,
    },
    {
      name: "Splash / Loading Screen",
      category: "digital",
      description: "App loading screen with logo animation",
      dimensions: "Device-native (375×812 mobile, 1440×900 desktop)",
      format: "Lottie JSON or CSS animation",
      designNotes: `${primary} background. Logo mark centered, fading in with ${logo?.lockups?.[2]?.description || "icon mark"} first, then wordmark. Duration: 1.5s.`,
    },
    {
      name: "Favicon",
      category: "digital",
      description: "Browser tab icon",
      dimensions: "16×16, 32×32px",
      format: "ICO + PNG",
      designNotes: `${primary} background, simplified mark. Must be legible at 16px. No text — icon only.`,
    },
  ];

  // ── Marketing Applications ───────────────────────────
  const marketing: ApplicationSpec[] = [
    {
      name: "Twitter/X Banner",
      category: "marketing",
      description: "Profile header banner",
      dimensions: "1500×500px",
      format: "PNG",
      designNotes: `${primary} background. ${p.name} left-aligned in ${displayFont}. Tagline right-aligned. Subtle geometric pattern.`,
    },
    {
      name: "Twitter/X Profile",
      category: "marketing",
      description: "Profile avatar",
      dimensions: "400×400px",
      format: "PNG",
      designNotes: `${primary} circle background. White icon mark centered. Clean and recognizable at small sizes.`,
    },
    {
      name: "LinkedIn Banner",
      category: "marketing",
      description: "Company page header",
      dimensions: "1128×191px",
      format: "PNG",
      designNotes: `${primary} with gradient overlay. ${p.name} centered. Professional, minimal.`,
    },
    {
      name: "Product Hunt Thumbnail",
      category: "marketing",
      description: "PH listing main image",
      dimensions: "635×355px",
      format: "PNG",
      designNotes: `${primary} background. ${p.name} headline. Core value prop in ${textFont}. Screenshot or illustration of product on right side.`,
    },
    {
      name: "Product Hunt Gallery",
      category: "marketing",
      description: "PH gallery images (×5)",
      dimensions: "1270×760px",
      format: "PNG",
      designNotes: `Product screenshots with ${primary} accent border. Caption overlay in ${displayFont}. Clean, informative.`,
    },
    {
      name: "App Store Screenshots",
      category: "marketing",
      description: "iOS App Store screenshots (×6)",
      dimensions: "1284×2778px (iPhone), 2048×2732px (iPad)",
      format: "PNG",
      designNotes: `${primary} header bar. iPhone frame with product screenshot. Feature callout text in ${displayFont}. Consistent across all 6 screens.`,
    },
    {
      name: "Press Kit",
      category: "marketing" as const,
      description: "ZIP archive of logo + brand assets for press",
      dimensions: "Various",
      format: "ZIP (SVG + PNG + PDF)",
      designNotes: `Logo in all variants (full colour, reversed, mono, icon-only, wordmark-only). Brand colour palette card. ${p.name} fact sheet.`,
    },
  ];

  // ── In-Product Applications ──────────────────────────
  const inProduct: ApplicationSpec[] = [
    {
      name: "Onboarding Screens",
      category: "in_product",
      description: "3-5 onboarding illustrations with copy",
      dimensions: "375×812px per screen",
      format: "SVG illustration + HTML overlay",
      designNotes: `Illustration style: ${bso.visualIdentity.illustrationStyle?.style || "geometric abstract"}. ${primary} accents. ${displayFont} headlines. Progress dots in ${accent}.`,
    },
    {
      name: "Empty States",
      category: "in_product",
      description: "Empty state illustrations (×5)",
      dimensions: "Container-adaptive (max 300×300px illustration)",
      format: "SVG",
      designNotes: `Light, friendly illustrations. ${accent} accents. Meaningful metaphors for each state (no data, no results, no notifications, no messages, error).`,
    },
    {
      name: "Error Page (404)",
      category: "in_product",
      description: "Custom 404 error page",
      dimensions: "Full viewport",
      format: "HTML/CSS",
      designNotes: `${primary} or neutral background. Large "404" in ${displayFont}. Friendly message in ${textFont}. ${accent} CTA: "Go Home". Illustration or icon above.`,
    },
    {
      name: "Error Page (500)",
      category: "in_product",
      description: "Custom 500 server error page",
      dimensions: "Full viewport",
      format: "HTML/CSS",
      designNotes: `Clean design. Apologetic yet professional tone. "Something went wrong" in ${displayFont}. ${accent} CTA: "Try Again". No blame, no technical jargon.`,
    },
    {
      name: "Notification Toast",
      category: "in_product",
      description: "Toast notification component",
      dimensions: "360×64px (mobile), 400×56px (desktop)",
      format: "HTML/CSS component",
      designNotes: `${primary} left border. White card with shadow. ${displayFont} title, ${textFont} message. ${accent} action button. Slide-in from right animation (300ms).`,
    },
    {
      name: "Loading Skeleton",
      category: "in_product",
      description: "Content loading placeholder states",
      dimensions: "Various — matches component sizes",
      format: "CSS animation",
      designNotes: `Grey placeholder shapes pulsing. ${primary} shimmer effect. Rounded corners matching brand ${bso.visualIdentity.iconography?.cornerRadius || 2}px radius.`,
    },
  ];

  // ── Collect as BSO assets ────────────────────────────
  const allSpecs = [...digital, ...marketing, ...inProduct];
  const generatedAssets: GeneratedAsset[] = allSpecs.map((spec) => ({
    name: spec.name,
    type: spec.category,
    format: spec.format,
    path: `assets/${spec.category}/${spec.name.toLowerCase().replace(/\s+/g, "-")}`,
    description: spec.description,
  }));

  // Update BSO
  store.update("assets", {
    generated: generatedAssets,
    exportFormats: ["css", "tailwind", "scss", "figma", "svg", "png", "pdf", "zip"],
  } as Partial<AssetInfo>);

  store.advanceStage(); // Stage 7 → 8

  return {
    success: true,
    digital,
    marketing,
    inProduct,
    totalAssets: allSpecs.length,
  };
}
