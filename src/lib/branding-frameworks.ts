/**
 * Branding Frameworks Library for VibeBranding.
 *
 * Encodes established branding theory into executable logic:
 * - 12 Jungian Brand Archetypes (Margaret Mark & Carol Pearson)
 * - Brand Personality Spectrum (5 axes)
 * - Kapferer's Brand Identity Prism
 * - Ogilvy Positioning Framework
 * - Tone of Voice dimensions
 */

// ─── 12 Jungian Brand Archetypes ─────────────────────────────

export interface ArchetypeDefinition {
  name: string;
  motto: string;
  desire: string;
  goal: string;
  fear: string;
  strategy: string;
  visualCues: string;
  verbalCues: string;
  colourMood: string;
  shapeLanguage: string;
  examples: string[];
}

export const ARCHETYPES: Record<string, ArchetypeDefinition> = {
  Hero: {
    name: "Hero",
    motto: "Where there's a will, there's a way",
    desire: "To prove worth through courageous acts",
    goal: "Mastery that improves the world",
    fear: "Weakness, vulnerability, being a coward",
    strategy: "Become as strong and competent as possible",
    visualCues: "Bold, dynamic compositions; strong contrasts; upward diagonal lines",
    verbalCues: "Confident, direct, inspiring; calls to action; challenge language",
    colourMood: "Bold reds, royal blues, metallic golds",
    shapeLanguage: "Triangles, chevrons, sharp angles — upward movement",
    examples: ["Nike", "Gatorade", "Marvel", "Army recruitment"],
  },
  Creator: {
    name: "Creator",
    motto: "If it can be imagined, it can be created",
    desire: "To create things of enduring value",
    goal: "To realize a vision",
    fear: "Mediocre execution, being derivative",
    strategy: "Develop artistic control and skill",
    visualCues: "Expressive, colourful, experimental; visible process",
    verbalCues: "Visionary, imaginative, expressive; 'imagine', 'create', 'build'",
    colourMood: "Vibrant spectrum, teals, unconventional pairings",
    shapeLanguage: "Organic, fluid, abstract — expressive forms",
    examples: ["Adobe", "LEGO", "Figma", "Canva"],
  },
  Explorer: {
    name: "Explorer",
    motto: "Don't fence me in",
    desire: "Freedom to discover yourself through exploring the world",
    goal: "A better, more authentic, more fulfilling life",
    fear: "Conformity, emptiness, being trapped",
    strategy: "Seek out new experiences, escape boredom",
    visualCues: "Vast spaces, horizons, maps, natural elements",
    verbalCues: "Adventurous, curious, independent; exploration language",
    colourMood: "Earth tones, deep ocean blues, forest greens",
    shapeLanguage: "Horizontals, organic curves, circular motifs — journey",
    examples: ["Jeep", "The North Face", "Patagonia", "Airbnb"],
  },
  Sage: {
    name: "Sage",
    motto: "The truth will set you free",
    desire: "To discover the truth",
    goal: "Understanding, wisdom, insight",
    fear: "Being misled, ignorance, falsehood",
    strategy: "Seek knowledge and share it",
    visualCues: "Clean, structured, minimal; grids, data visualization",
    verbalCues: "Authoritative, precise, educational; facts and evidence",
    colourMood: "Deep navy, charcoal, muted tones — gravitas",
    shapeLanguage: "Rectangles, grids, symmetry — order and structure",
    examples: ["Google", "Harvard", "The Economist", "IBM"],
  },
  Outlaw: {
    name: "Outlaw",
    motto: "Rules are made to be broken",
    desire: "Revenge or revolution",
    goal: "To overturn what isn't working",
    fear: "Powerlessness, being part of the system",
    strategy: "Disrupt, destroy, or shock",
    visualCues: "Dark, edgy, disruptive; high contrast; unexpected elements",
    verbalCues: "Rebellious, provocative, confrontational; anti-establishment",
    colourMood: "Black, deep reds, acid greens — danger and edge",
    shapeLanguage: "Jagged, asymmetrical, broken — disruption",
    examples: ["Harley-Davidson", "Apple (1984)", "Diesel", "Virgin"],
  },
  Magician: {
    name: "Magician",
    motto: "It can happen",
    desire: "To understand how things work and make dreams come true",
    goal: "Make dreams come true",
    fear: "Unintended negative consequences",
    strategy: "Develop a vision and make it real",
    visualCues: "Transformative, glowing, ethereal; impossible becomes possible",
    verbalCues: "Visionary, transformative, mystical; 'imagine', 'transform', 'magic'",
    colourMood: "Purples, magentas, golds, luminous effects",
    shapeLanguage: "Stars, spirals, circles — transformation and wonder",
    examples: ["Disney", "Apple (modern)", "Salesforce", "Dyson"],
  },
  Everyman: {
    name: "Everyman",
    motto: "All people are created equal",
    desire: "Connection with others",
    goal: "To belong",
    fear: "Standing out, being left out",
    strategy: "Be down-to-earth and relatable",
    visualCues: "Warm, familiar, unpretentious; real people, real situations",
    verbalCues: "Friendly, inclusive, plainspoken; 'we', 'us', 'together'",
    colourMood: "Warm neutrals, denim blues, natural tones",
    shapeLanguage: "Circles, soft rectangles — welcoming, no sharp edges",
    examples: ["IKEA", "Target", "eBay", "Levi's"],
  },
  Lover: {
    name: "Lover",
    motto: "I only have eyes for you",
    desire: "Intimacy and sensory pleasure",
    goal: "Being in a relationship with people, work, and experiences they love",
    fear: "Being unwanted, unloved",
    strategy: "Become more attractive emotionally and physically",
    visualCues: "Sensual, elegant, beautiful; attention to detail; intimate scale",
    verbalCues: "Warm, passionate, sensory; 'love', 'desire', 'beauty'",
    colourMood: "Soft pinks, rich reds, creams, champagne",
    shapeLanguage: "Curves, hearts, flowing forms — softness and sensuality",
    examples: ["Chanel", "Godiva", "Victoria's Secret", "Jaguar"],
  },
  Jester: {
    name: "Jester",
    motto: "You only live once",
    desire: "To live in the moment with full enjoyment",
    goal: "To have a great time and lighten up the world",
    fear: "Boredom, being boring",
    strategy: "Play, make jokes, have fun",
    visualCues: "Bright, colourful, playful; unexpected combinations; motion",
    verbalCues: "Witty, irreverent, fun; jokes, wordplay, surprise",
    colourMood: "Bright primaries, orange, yellow, lime — joy and energy",
    shapeLanguage: "Circles, blobs, bouncy — playful and unpredictable",
    examples: ["M&M's", "Old Spice", "Duolingo", "Dollar Shave Club"],
  },
  Caregiver: {
    name: "Caregiver",
    motto: "Love thy neighbour as thyself",
    desire: "To protect people and help others",
    goal: "To help others",
    fear: "Selfishness, ingratitude",
    strategy: "Do things for others",
    visualCues: "Soft, warm, nurturing; gentle imagery; human connection",
    verbalCues: "Nurturing, reassuring, supportive; 'care', 'protect', 'nurture'",
    colourMood: "Soft greens, warm creams, sky blues — comfort and safety",
    shapeLanguage: "Rounded, soft — nothing sharp or threatening",
    examples: ["Johnson & Johnson", "UNICEF", "Volvo", "Dove"],
  },
  Ruler: {
    name: "Ruler",
    motto: "Power isn't everything, it's the only thing",
    desire: "Control",
    goal: "Create a prosperous, successful community",
    fear: "Chaos, being overthrown",
    strategy: "Exercise power, take charge",
    visualCues: "Commanding, structured, premium; vertical lines; formal composition",
    verbalCues: "Authoritative, commanding, exclusive; leadership language",
    colourMood: "Deep purples, golds, black — power and prestige",
    shapeLanguage: "Vertical lines, crowns, shields — authority and protection",
    examples: ["Rolex", "Mercedes", "American Express", "Microsoft"],
  },
  Innocent: {
    name: "Innocent",
    motto: "Free to be you and me",
    desire: "To experience paradise",
    goal: "To be happy",
    fear: "Doing something wrong that provokes punishment",
    strategy: "Do things right, be optimistic",
    visualCues: "Clean, simple, pure; white space; natural light",
    verbalCues: "Optimistic, simple, straightforward; 'simple', 'pure', 'good'",
    colourMood: "Pastels, clean whites, sky blues — purity and simplicity",
    shapeLanguage: "Circles, simple geometry — purity and wholeness",
    examples: ["Dove (soap)", "Innocent Drinks", "Coca-Cola (classic)", "Whole Foods"],
  },
};

// ─── Brand Personality Spectrum ──────────────────────────────

export interface PersonalitySpectrum {
  excitingVsCalm: number; // 0=calm, 100=exciting
  modernVsClassic: number; // 0=classic, 100=modern
  playfulVsSerious: number; // 0=serious, 100=playful
  accessibleVsExclusive: number; // 0=exclusive, 100=accessible
  boldVsUnderstated: number; // 0=understated, 100=bold
}

export function getSpectrumFromArchetypes(archetypes: ArchetypeDefinition[]): PersonalitySpectrum {
  if (!archetypes.length) {
    return { excitingVsCalm: 50, modernVsClassic: 50, playfulVsSerious: 50, accessibleVsExclusive: 50, boldVsUnderstated: 50 };
  }

  const spectrumMap: Record<string, Partial<PersonalitySpectrum>> = {
    Hero: { excitingVsCalm: 85, boldVsUnderstated: 90 },
    Creator: { excitingVsCalm: 70, modernVsClassic: 80, playfulVsSerious: 65 },
    Explorer: { excitingVsCalm: 75, boldVsUnderstated: 70 },
    Sage: { modernVsClassic: 30, playfulVsSerious: 20, boldVsUnderstated: 25 },
    Outlaw: { excitingVsCalm: 90, boldVsUnderstated: 95, playfulVsSerious: 80 },
    Magician: { excitingVsCalm: 80, modernVsClassic: 70, boldVsUnderstated: 75 },
    Everyman: { accessibleVsExclusive: 90, playfulVsSerious: 50 },
    Lover: { accessibleVsExclusive: 30, boldVsUnderstated: 40 },
    Jester: { excitingVsCalm: 95, playfulVsSerious: 95, boldVsUnderstated: 85 },
    Caregiver: { excitingVsCalm: 30, accessibleVsExclusive: 85, boldVsUnderstated: 20 },
    Ruler: { accessibleVsExclusive: 10, modernVsClassic: 25, boldVsUnderstated: 30 },
    Innocent: { excitingVsCalm: 35, accessibleVsExclusive: 80, playfulVsSerious: 60 },
  };

  // Weighted average across archetypes
  const result: PersonalitySpectrum = {
    excitingVsCalm: 0, modernVsClassic: 0, playfulVsSerious: 0,
    accessibleVsExclusive: 0, boldVsUnderstated: 0,
  };

  const keys = Object.keys(result) as Array<keyof PersonalitySpectrum>;
  for (const archetype of archetypes) {
    const weights = spectrumMap[archetype.name] || {};
    for (const key of keys) {
      result[key] += (weights[key] ?? 50);
    }
  }

  for (const key of keys) {
    result[key] = Math.round(result[key] / archetypes.length);
  }

  return result;
}

// ─── Ogilvy Positioning Framework ────────────────────────────

export function buildPositioningStatement(
  audience: string,
  need: string,
  product: string,
  category: string,
  differentiator: string,
  competitor: string,
  competitorLimitation: string
): string {
  return `For ${audience} who ${need}, ${product} is the ${category} that ${differentiator}, unlike ${competitor} which ${competitorLimitation}.`;
}

// ─── Tone of Voice Dimensions ────────────────────────────────

export interface ToneDimensions {
  formalToCasual: number;
  seriousToWitty: number;
  authoritativeToApproachable: number;
  conventionalToIrreverent: number;
}

export function getToneFromArchetypes(archetypes: ArchetypeDefinition[]): ToneDimensions {
  const toneMap: Record<string, Partial<ToneDimensions>> = {
    Hero: { formalToCasual: 40, authoritativeToApproachable: 30 },
    Creator: { formalToCasual: 60, seriousToWitty: 50, conventionalToIrreverent: 50 },
    Explorer: { formalToCasual: 70, seriousToWitty: 50 },
    Sage: { formalToCasual: 20, seriousToWitty: 15, authoritativeToApproachable: 25, conventionalToIrreverent: 15 },
    Outlaw: { formalToCasual: 85, seriousToWitty: 75, conventionalToIrreverent: 95 },
    Magician: { formalToCasual: 45, seriousToWitty: 55 },
    Everyman: { formalToCasual: 80, authoritativeToApproachable: 90 },
    Lover: { formalToCasual: 30, authoritativeToApproachable: 40 },
    Jester: { formalToCasual: 95, seriousToWitty: 95, conventionalToIrreverent: 90 },
    Caregiver: { formalToCasual: 60, authoritativeToApproachable: 85, seriousToWitty: 30 },
    Ruler: { formalToCasual: 10, seriousToWitty: 10, authoritativeToApproachable: 15, conventionalToIrreverent: 5 },
    Innocent: { formalToCasual: 55, authoritativeToApproachable: 75, conventionalToIrreverent: 30 },
  };

  const result: ToneDimensions = {
    formalToCasual: 0, seriousToWitty: 0,
    authoritativeToApproachable: 0, conventionalToIrreverent: 0,
  };

  const keys = Object.keys(result) as Array<keyof ToneDimensions>;
  for (const archetype of archetypes) {
    const weights = toneMap[archetype.name] || {};
    for (const key of keys) {
      result[key] += (weights[key] ?? 50);
    }
  }

  for (const key of keys) {
    result[key] = Math.round(result[key] / archetypes.length);
  }

  return result;
}
