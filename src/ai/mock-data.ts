/**
 * Mock Data Generator for VibeBranding Pipeline
 *
 * Produces plausible brand generation output for each of the 9 stages,
 * derived deterministically from the product input. Used when AI providers
 * (Gemini, Replicate) are unavailable or quota-exhausted.
 *
 * Usage: query param ?mock=true on POST /api/brand
 */

import type { ProductInfo, BrandStateObject } from "@/core/bso/types";

// ─── Helpers ──────────────────────────────────────────────────────

function seededHash(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const chr = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => {
    const ha = seededHash(String(a) + seed);
    const hb = seededHash(String(b) + seed);
    return ha - hb;
  });
  return shuffled.slice(0, n);
}

// ─── Archetype Templates ─────────────────────────────────────────

type ArchetypeName = "Hero" | "Creator" | "Explorer" | "Sage" | "Outlaw" | "Magician" | "Everyman" | "Lover" | "Jester" | "Caregiver" | "Ruler" | "Innocent";

const ARCHETYPES: { archetype: ArchetypeName; weight: number }[] = [
  { archetype: "Creator", weight: 100 },
  { archetype: "Sage", weight: 85 },
  { archetype: "Magician", weight: 70 },
  { archetype: "Explorer", weight: 60 },
  { archetype: "Hero", weight: 50 },
  { archetype: "Caregiver", weight: 40 },
  { archetype: "Innocent", weight: 30 },
  { archetype: "Everyman", weight: 25 },
  { archetype: "Lover", weight: 20 },
  { archetype: "Jester", weight: 15 },
  { archetype: "Ruler", weight: 10 },
  { archetype: "Outlaw", weight: 5 },
];

const EMOTIONAL_TERRITORIES = [
  "Flow-State Craftsmanship",
  "Quiet Confidence",
  "Playful Precision",
  "Bold Simplicity",
  "Thoughtful Disruption",
  "Calm Authority",
  "Joyful Clarity",
  "Grounded Innovation",
];

const BRAND_VALUES_SET = [
  "Craft", "Precision", "Clarity", "Innovation", "Accessibility",
  "Community", "Sustainability", "Transparency", "Quality", "Speed",
  "Simplicity", "Empowerment", "Creativity", "Inclusivity", "Reliability",
];

const TONE_OF_VOICE_DEFAULTS = {
  formalToCasual: 35,
  seriousToWitty: 40,
  authoritativeToApproachable: 70,
  conventionalToIrreverent: 45,
};

const POSITIONING_TEMPLATES = [
  "For {audience} who need {need}, {name} is the {category} that delivers {benefit} without compromise.",
  "Stop {pain}. Start {benefit}. {name} is the {category} built for {audience}.",
  "The {category} that {audience} deserves. {name} combines {benefit} with {quality}.",
  "Built for {audience}. Backed by {quality}. {name} redefines what a {category} can do.",
];

// ─── Visual Identity Templates ───────────────────────────────────

interface MockPalette {
  primary: string;
  secondary: string;
  accent: string;
  harmonyType: "complementary" | "triadic" | "analogous" | "split_complementary" | "monochromatic";
}

const PALETTES: MockPalette[] = [
  { primary: "#2563EB", secondary: "#7C3AED", accent: "#F59E0B", harmonyType: "triadic" },
  { primary: "#DC2626", secondary: "#2563EB", accent: "#16A34A", harmonyType: "complementary" },
  { primary: "#0891B2", secondary: "#BE123C", accent: "#FBBF24", harmonyType: "split_complementary" },
  { primary: "#6366F1", secondary: "#EC4899", accent: "#F59E0B", harmonyType: "triadic" },
  { primary: "#059669", secondary: "#D97706", accent: "#DC2626", harmonyType: "complementary" },
];

interface FontPair {
  display: string;
  text: string;
  mono: string;
}

const FONT_PAIRS: FontPair[] = [
  { display: "Inter", text: "Inter", mono: "JetBrains Mono" },
  { display: "Clash Display", text: "Satoshi", mono: "Fira Code" },
  { display: "Cabinet Grotesk", text: "Inter", mono: "JetBrains Mono" },
  { display: "PANGRAMUS", text: "Now", mono: "DM Mono" },
  { display: "Geist", text: "Geist Text", mono: "Geist Mono" },
];

// ─── Mock Output Generator ───────────────────────────────────────

/**
 * Generate a mock BrandStateObject for a given product and stage.
 * This is a stateless deterministic generator — same input always produces the same output.
 */
export function generateMockBSO(product: Partial<ProductInfo>, stage: number): Partial<BrandStateObject> {
  const name = product.name || "Unbranded";
  const category = product.category || "SaaS";
  const description = product.description || "A product that helps users achieve their goals.";
  const seed = seededHash(name);
  const palette = PALETTES[seed % PALETTES.length];
  const fontPair = FONT_PAIRS[seed % FONT_PAIRS.length];
  const emotionalTerritory = EMOTIONAL_TERRITORIES[seed % EMOTIONAL_TERRITORIES.length];
  const values = pickN(BRAND_VALUES_SET, 4, seed + 1);

  const bso: Partial<BrandStateObject> = {};

  if (stage >= 1) {
    bso.product = {
      name,
      tagline: `The ${category.toLowerCase()} that ${description.split(" ").slice(0, 6).join(" ").toLowerCase()}...`,
      description,
      category,
      audience: {
        demographics: product.audience?.demographics || "Tech-savvy professionals aged 25–45",
        psychographics: product.audience?.psychographics || "Value-driven, early adopters who prioritize quality and craftsmanship",
        techSophistication: product.audience?.techSophistication || "high",
      },
      competitors: (product.competitors || []).slice(0, 5),
    };

    const archetypes = [
      { ...ARCHETYPES[seed % ARCHETYPES.length], rationale: `Primary archetype reflecting ${name}'s core identity.` },
      { ...ARCHETYPES[(seed + 3) % ARCHETYPES.length], weight: 75, rationale: `Secondary archetype adding depth.` },
      { ...ARCHETYPES[(seed + 7) % ARCHETYPES.length], weight: 50, rationale: `Tertiary archetype for nuance.` },
    ];

    bso.strategy = {
      positioning: `For ${bso.product.audience.demographics} who need a better ${category.toLowerCase()}, ${name} delivers exceptional quality and innovation.`,
      personalityArchetypes: archetypes,
      personalitySpectrum: {
        excitingVsCalm: (seed * 7 + 3) % 100,
        modernVsClassic: (seed * 13 + 7) % 100,
        playfulVsSerious: (seed * 5 + 11) % 100,
        accessibleVsExclusive: (seed * 3 + 17) % 100,
        boldVsUnderstated: (seed * 11 + 5) % 100,
      },
      brandValues: values,
      toneOfVoice: {
        formalToCasual: (seed * 7 + 13) % 100,
        seriousToWitty: (seed * 11 + 17) % 100,
        authoritativeToApproachable: (seed * 5 + 29) % 100,
        conventionalToIrreverent: (seed * 3 + 37) % 100,
      },
      emotionalTerritory,
    };
  }

  if (stage >= 3) {
    bso.verbalIdentity = {
      naming: {
        candidates: [
          { name: `${name} Pro`, approach: "descriptive" as const, rationale: "Tier-based positioning for the premium version", scores: { phonetics: 8, memorability: 7, distinctiveness: 5, overall: 7 }, availability: { dotCom: true, dotIo: true, dotApp: true, socialHandles: { twitter: true, github: true } }, trademarkRisk: "low" as const, negativeMeanings: [] },
          { name: `Neo${name}`, approach: "invented" as const, rationale: "Combines 'neo' (new) with product concept for a forward-looking identity", scores: { phonetics: 8, memorability: 8, distinctiveness: 7, overall: 8 }, availability: { dotCom: false, dotIo: true, dotApp: true, socialHandles: { twitter: true, github: false } }, trademarkRisk: "low" as const, negativeMeanings: [] },
          { name: `${name}Hub`, approach: "compound" as const, rationale: "Positions the product as a central platform", scores: { phonetics: 7, memorability: 8, distinctiveness: 6, overall: 7 }, availability: { dotCom: true, dotIo: true, dotApp: true, socialHandles: { twitter: true, github: true } }, trademarkRisk: "low" as const, negativeMeanings: [] },
          { name: `${name}Flow`, approach: "metaphorical" as const, rationale: "Evokes smooth, continuous experience", scores: { phonetics: 9, memorability: 9, distinctiveness: 8, overall: 9 }, availability: { dotCom: false, dotIo: true, dotApp: false, socialHandles: { twitter: false, github: true } }, trademarkRisk: "medium" as const, negativeMeanings: [] },
          { name: `${name}Spark`, approach: "evocative" as const, rationale: "Suggests ignition, energy, and inspiration", scores: { phonetics: 9, memorability: 10, distinctiveness: 9, overall: 9 }, availability: { dotCom: true, dotIo: true, dotApp: true, socialHandles: { twitter: true, github: true } }, trademarkRisk: "medium" as const, negativeMeanings: [] },
        ],
        recommended: 3,
        selectedName: `${name}Flow`,
      },
      taglines: [
        { text: `${name}. Where ${category.toLowerCase()} meets excellence.`, approach: "positioning_condensed" as const, scores: { memorability: 8, originality: 6, brandFit: 9, searchability: 7, internationalLegibility: 9 } },
        { text: `Build better with ${name}.`, approach: "imperative" as const, scores: { memorability: 9, originality: 7, brandFit: 8, searchability: 10, internationalLegibility: 10 } },
        { text: `The ${category.toLowerCase()} you've been waiting for.`, approach: "emotion_led" as const, scores: { memorability: 7, originality: 5, brandFit: 8, searchability: 6, internationalLegibility: 9 } },
        { text: "Stop struggling. Start shipping.", approach: "benefit_led" as const, scores: { memorability: 9, originality: 8, brandFit: 7, searchability: 8, internationalLegibility: 10 } },
        { text: "What will you build?", approach: "question" as const, scores: { memorability: 8, originality: 9, brandFit: 7, searchability: 5, internationalLegibility: 10 } },
      ],
      messagingHierarchy: {
        heroHeadline: `${name}: The ${category} You Need`,
        subHeadline: `Built for ${bso.product?.audience?.demographics || "teams"} who demand ${values[0]?.toLowerCase() || "quality"} and ${values[1]?.toLowerCase() || "innovation"}.`,
        bodyDescription: description,
        primaryCTA: "Get Started Free",
        secondaryCTA: "See How It Works",
        featureHeadlines: [
          `${values[0] || "Quality"} at every layer`,
          `Seamless ${category.toLowerCase()} integration`,
          `Built for ${bso.product?.audience?.demographics?.split(" ")[0] || "modern"} workflows`,
        ],
      },
      copyExamples: {
        toneVariations: {
          onBrand: [
            `${name} brings ${category.toLowerCase()} into the modern era. No compromises.`,
            `Ship faster. Build better. ${name}.`,
          ],
          tooFormal: [
            `${name} offers a comprehensive ${category.toLowerCase()} solution for enterprise environments.`,
          ],
          tooCasual: [
            `Yo check out ${name}, it's pretty dope for your ${category.toLowerCase()} stuff.`,
          ],
        },
        microcopy: {
          buttonLabels: { submit: "Generate", cancel: "Back", save: "Save Brand", delete: "Remove", confirm: "Yes, Delete" },
          errorMessages: { generic: "Something went wrong. Please try again.", network: "Connection lost. Check your internet.", auth: "Please sign in to continue." },
          emptyStates: { dashboard: "No brands yet. Generate your first one!", search: "No brands match your search." },
          onboardingTooltips: { welcome: "Welcome to VibeBranding. Let's build your brand.", step1: "Start by describing your product." },
          successStates: { brandCreated: "Your brand has been generated successfully!", exportDone: "Your brand kit has been exported." },
          loadingStates: { generating: "Generating your brand identity...", analysing: "Analysing your product..." },
        },
        brandVocabulary: {
          ownedWords: ["Generate", "Brand", "Vibe", "Identity", values[0] || "Quality"],
          avoidedWords: ["Template", "Generic", "Stock", "Basic"],
          namingConventions: "Sentence case for all UI text. Title case for brand names.",
        },
      },
    };
  }

  if (stage >= 4) {
    bso.visualIdentity = {
      colourSystem: {
        harmonyType: palette.harmonyType,
        primaryColour: palette.primary,
        secondaryColour: palette.secondary,
        accentColour: palette.accent,
        neutralScale: [
          { name: "50", hex: "#F8FAFC", hsl: "210 40% 98%", role: "lightest", lightMode: "#F8FAFC", darkMode: "#0F172A" },
          { name: "100", hex: "#F1F5F9", hsl: "210 40% 96%", role: "background-light", lightMode: "#F1F5F9", darkMode: "#1E293B" },
          { name: "200", hex: "#E2E8F0", hsl: "210 40% 92%", role: "border", lightMode: "#E2E8F0", darkMode: "#334155" },
          { name: "300", hex: "#CBD5E1", hsl: "210 40% 84%", role: "border-medium", lightMode: "#CBD5E1", darkMode: "#475569" },
          { name: "400", hex: "#94A3B8", hsl: "210 40% 68%", role: "text-muted", lightMode: "#94A3B8", darkMode: "#64748B" },
          { name: "500", hex: "#64748B", hsl: "210 40% 52%", role: "text-secondary", lightMode: "#64748B", darkMode: "#94A3B8" },
          { name: "600", hex: "#475569", hsl: "210 40% 40%", role: "text", lightMode: "#475569", darkMode: "#CBD5E1" },
          { name: "700", hex: "#334155", hsl: "210 40% 32%", role: "text-strong", lightMode: "#334155", darkMode: "#E2E8F0" },
          { name: "800", hex: "#1E293B", hsl: "210 40% 22%", role: "heading", lightMode: "#1E293B", darkMode: "#F1F5F9" },
          { name: "900", hex: "#0F172A", hsl: "210 40% 12%", role: "heading-strong", lightMode: "#0F172A", darkMode: "#F8FAFC" },
          { name: "950", hex: "#020617", hsl: "210 40% 6%", role: "darkest", lightMode: "#020617", darkMode: "#FFFFFF" },
        ],
        semanticColours: [
          { name: "success", hex: "#16A34A", hsl: "142 71% 45%", role: "success", lightMode: "#16A34A", darkMode: "#4ADE80" },
          { name: "warning", hex: "#D97706", hsl: "38 92% 50%", role: "warning", lightMode: "#D97706", darkMode: "#FBBF24" },
          { name: "error", hex: "#DC2626", hsl: "0 72% 51%", role: "error", lightMode: "#DC2626", darkMode: "#F87171" },
          { name: "info", hex: "#2563EB", hsl: "217 91% 60%", role: "info", lightMode: "#2563EB", darkMode: "#60A5FA" },
        ],
        surfaceColours: [
          { name: "surface", hex: "#FFFFFF", hsl: "0 0% 100%", role: "surface", lightMode: "#FFFFFF", darkMode: "#0F172A" },
        ],
        textColours: [
          { name: "text-primary", hex: "#0F172A", hsl: "210 40% 12%", role: "text", lightMode: "#0F172A", darkMode: "#F8FAFC" },
        ],
        distribution: { primaryPercent: 60, secondaryPercent: 30, accentPercent: 10 },
        wcagReport: {
          overall: "pass",
          checks: [
            { foreground: palette.primary, background: "#FFFFFF", contrastRatio: 4.5, normalTextPass: true, largeTextPass: true },
          ],
        },
        tokens: {
          css: `/* ${name} Colour System */\n:root {\n  --color-primary: ${palette.primary};\n  --color-secondary: ${palette.secondary};\n  --color-accent: ${palette.accent};\n}`,
          tailwind: `// ${name} Tailwind Config\ncolors: {\n  primary: '${palette.primary}',\n  secondary: '${palette.secondary}',\n  accent: '${palette.accent}',\n}`,
          scss: `// ${name} SCSS Variables\n$color-primary: ${palette.primary};\n$color-secondary: ${palette.secondary};\n$color-accent: ${palette.accent};`,
        },
      },
      typography: {
        displayFont: { name: fontPair.display, classification: "sans-serif", source: "google", weights: [400, 600, 700, 800], isVariable: true, fallbackStack: "system-ui, sans-serif", rationale: "Clean geometric form conveys precision and modernity." },
        textFont: { name: fontPair.text, classification: "sans-serif", source: "google", weights: [300, 400, 500, 600, 700], isVariable: true, fallbackStack: "system-ui, sans-serif", rationale: "Highly legible at all sizes with excellent screen rendering." },
        monoFont: { name: fontPair.mono, classification: "monospace", source: "google", weights: [400, 500, 700], isVariable: false, fallbackStack: "monospace", rationale: "Developer-friendly monospace for code display." },
        typeScale: {
          ratio: 1.25,
          ratioName: "major_third",
          sizes: [
            { name: "xs", sizePx: 12, sizeRem: 0.75, lineHeight: 1.5, usage: "Captions, labels" },
            { name: "sm", sizePx: 14, sizeRem: 0.875, lineHeight: 1.5, usage: "Small text" },
            { name: "base", sizePx: 16, sizeRem: 1, lineHeight: 1.5, usage: "Body text" },
            { name: "lg", sizePx: 20, sizeRem: 1.25, lineHeight: 1.4, usage: "Lead paragraphs" },
            { name: "xl", sizePx: 24, sizeRem: 1.5, lineHeight: 1.3, usage: "Sub-headings" },
            { name: "2xl", sizePx: 30, sizeRem: 1.875, lineHeight: 1.25, usage: "Section headings" },
            { name: "3xl", sizePx: 38, sizeRem: 2.375, lineHeight: 1.2, usage: "Page headings" },
            { name: "4xl", sizePx: 48, sizeRem: 3, lineHeight: 1.1, usage: "Display headings" },
            { name: "5xl", sizePx: 60, sizeRem: 3.75, lineHeight: 1.05, usage: "Hero display" },
          ],
        },
        pairingRationale: `${fontPair.display} for display and ${fontPair.text} for body creates a ${seed % 2 === 0 ? "harmonious" : "subtle but effective"} contrast with excellent readability.`,
        tokens: {
          css: `/* ${name} Typography */\n--font-display: '${fontPair.display}', system-ui, sans-serif;\n--font-body: '${fontPair.text}', system-ui, sans-serif;`,
          tailwind: `// ${name} Font Config\nfontFamily: {\n  display: ['${fontPair.display}', 'system-ui'],\n  body: ['${fontPair.text}', 'system-ui'],\n}`,
        },
      },
      iconography: {
        strokeWeight: 1.5,
        cornerRadius: 2,
        fillApproach: "outline",
        viewBox: 24,
        coreIcons: [
          { name: "brand", category: "product", description: "${name} brand icon" },
          { name: "sparkle", category: "ui", description: "Action sparkle" },
        ],
        featureIcons: [
          { name: "dashboard", category: "navigation", description: "Dashboard icon" },
        ],
        appIcon: {
          description: "Styled lettermark inside rounded square",
          sizes: [1024, 512, 192, 180, 152, 120, 76, 48, 32, 16],
          platformAdaptations: "iOS rounded rect, Android adaptive, web favicon",
        },
      },
      illustrationStyle: {
        style: seed % 3 === 0 ? "geometric_abstract" as const : seed % 3 === 1 ? "line_art_sketch" as const : "isometric" as const,
        rationale: `${emotionalTerritory} expressed through clean, modern visuals.`,
        strokeWeight: 1.5,
        sceneDescriptions: [
          { name: "Hero Marketing", purpose: "marketing" as const, description: "Main hero illustration for landing page", prompt: "Abstract geometric composition with ${category} elements" },
          { name: "Onboarding Flow", purpose: "onboarding" as const, description: "Step-by-step visual guide", prompt: "Simplified ${category} workflow illustration" },
        ],
      },
      motionLanguage: {
        personality: {
          duration: seed % 3 === 0 ? "snappy" as const : seed % 3 === 1 ? "quick" as const : "deliberate" as const,
          easing: seed % 2 === 0 ? "spring" as const : "smooth" as const,
          style: "functional" as const,
        },
        tokens: {
          css: `/* ${name} Motion Tokens */\n--duration-fast: 150ms;\n--duration-normal: 250ms;\n--duration-slow: 400ms;\n--easing-default: cubic-bezier(0.4, 0, 0.2, 1);`,
          js: `export const motion = { fast: 150, normal: 250, slow: 400, easing: [0.4, 0, 0.2, 1] };`,
        },
        referenceAnimations: [
          { name: "fade-in", description: "Standard fade in", duration: "250ms", easing: "ease-out" },
          { name: "slide-up", description: "Content enters from below", duration: "300ms", easing: "spring" },
        ],
        logoSting: {
          entryAnimation: `${name} mark scales up with a spring motion`,
          loopAnimation: undefined,
          exitAnimation: "Fade out with 200ms delay",
          totalDuration: "2.5s",
        },
      },
    };
  }

  if (stage >= 1 && !bso.metadata) {
    bso.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stage: Math.min(stage, 9),
      history: [],
    };
  }

  return bso;
}

/**
 * Generate a mock stage result as returned by the runXxx() module functions.
 */
export function generateMockStageResult(stage: number, product: Partial<ProductInfo>): Record<string, unknown> {
  const bso = generateMockBSO(product, stage);

  switch (stage) {
    case 1:
      return {
        success: true,
        audiencePersona: bso.product?.audience?.demographics || "Tech-savvy professionals",
        positioningStatement: bso.strategy?.positioning || "",
        competitorAnalysis: "Mock competitor analysis generated.",
        report: `# Brand Discovery Report\n\nProduct: ${product.name}\n\nMock report generated.`,
      };

    case 2:
      return {
        success: true,
        archetypes: bso.strategy?.personalityArchetypes || [],
        emotionalTerritory: bso.strategy?.emotionalTerritory || "Flow-State Craftsmanship",
        values: bso.strategy?.brandValues || [],
        toneSummary: `Tone: ${bso.strategy?.toneOfVoice ? `${100 - (bso.strategy.toneOfVoice.formalToCasual)}% casual` : "Balanced"}`,
      };

    case 3:
      return {
        success: true,
        candidates: bso.verbalIdentity?.naming?.candidates || [],
        recommended: bso.verbalIdentity?.naming?.recommended || 0,
      };

    case 4:
      return {
        success: true,
        primary: bso.visualIdentity?.colourSystem?.primaryColour || "#2563EB",
        secondary: bso.visualIdentity?.colourSystem?.secondaryColour || "#7C3AED",
        accent: bso.visualIdentity?.colourSystem?.accentColour || "#F59E0B",
        harmonyType: bso.visualIdentity?.colourSystem?.harmonyType || "triadic",
        wcagPassed: true,
        displayFont: bso.visualIdentity?.typography?.displayFont?.name || "Inter",
        textFont: bso.visualIdentity?.typography?.textFont?.name || "Inter",
        monoFont: bso.visualIdentity?.typography?.monoFont?.name || "JetBrains Mono",
        typeScaleRatio: bso.visualIdentity?.typography?.typeScale?.ratio || 1.25,
      };

    case 6:
      return {
        success: true,
        taglines: bso.verbalIdentity?.taglines || [],
        heroHeadline: bso.verbalIdentity?.messagingHierarchy?.heroHeadline || `${product.name}: The ${product.category} You Need`,
        primaryCTA: bso.verbalIdentity?.messagingHierarchy?.primaryCTA || "Get Started Free",
      };

    default:
      return { success: true };
  }
}
