import type { PromptTemplate, PromptContext } from "./index";
import { PromptEngine } from "./index";

/**
 * Pre-registered prompt templates for each branding module.
 * Each template receives the full BSO context and produces a module-specific prompt.
 */

const templates: Record<string, PromptTemplate> = {
  // ─── Stage 1: Discovery ──────────────────────────────
  discovery: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `You are a Brand Discovery specialist. Your task is to analyze the following product and produce:

1. **Audience Persona Profile** — demographics, psychographics, tech sophistication, aesthetics they trust, language they use
2. **Brand Positioning Statement** — "For [audience] who [need], [product] is the [category] that [differentiator], unlike [competitor] which [limitation]"
3. **Competitive Landscape Analysis** — identify 3-5 key competitors and analyze their brand patterns

Product: ${bso.product.name || "(provide product name)"}
Description: ${bso.product.description || "(provide description)"}
Category: ${bso.product.category || "(provide category)"}
Target Audience: ${bso.product.audience.demographics || "(describe audience)"}
Competitors: ${bso.product.competitors.map(c => c.name).join(", ") || "(unknown — research needed)"}

Output your analysis in structured format for insertion into the Brand State Object.`;
  },

  // ─── Stage 2: Strategy ──────────────────────────────
  strategy: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `You are a Brand Strategist. Based on the product discovery data, define:

1. **Brand Archetype(s)** — choose from the 12 Jungian archetypes with weighted blends.
   CRITICAL RULE: Avoid the default combination of "Creator + Sage". This is the most overused archetype pairing in tech. Force genuinely unexpected combinations that create tension and interest.
   For each archetype: explain the specific brand implication that would NOT work with any other archetype.
2. **Personality Spectrum** — score the brand on 5 axes (0-100):
   - Exciting vs Calm
   - Modern vs Classic
   - Playful vs Serious
   - Accessible vs Exclusive
   - Bold vs Understated
3. **Emotional Territory** — a phrase capturing the core feeling (e.g., "confident clarity").
   Must be specific enough that no competitor would use the same phrase.
4. **Brand Values** — 3-5 specific, actionable values. Not generic (avoid: quality, innovation, trust).
5. **Tone of Voice** — 4 dimensions (Formal↔Casual, Serious↔Witty, Authoritative↔Approachable, Conventional↔Irreverent) with example phrases

Product: ${bso.product.name}
Positioning: ${bso.strategy.positioning || "Not yet defined"}
Audience: ${bso.product.audience.demographics}
Competitors: ${bso.product.competitors.map(c => c.name).join(", ")}`;
  },

  // ─── Stage 3: Naming ────────────────────────────────
  naming: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `You are a Brand Naming specialist. Generate 15-25 name candidates across 5 approaches:

1. **Descriptive** (3-5 names) — communicates function directly
2. **Evocative** (3-5 names) — emotional association
3. **Invented/Coined** (3-5 names) — unique, phonetically distinctive
4. **Metaphorical** (3-5 names) — borrowed meaning from another domain
5. **Compound/Portmanteau** (3-5 names) — merging two concepts

For each candidate, evaluate:
- Phonetic quality (syllable count, pronunciation ease)
- Memorability (1-10)
- Potential domain availability (.com, .io, .app)
- Trademark risk (low/medium/high)
- Negative meanings in major languages

Product: ${bso.product.name}
Category: ${bso.product.category}
Emotional Territory: ${bso.strategy.emotionalTerritory}
Values: ${bso.strategy.brandValues.join(", ")}
Tone: ${describeTone(bso.strategy.toneOfVoice)}`;
  },

  // ─── Stage 4: Colour ────────────────────────────────
  color: (ctx: PromptContext) => {
    const { bso } = ctx;
    const archetypes = bso.strategy.personalityArchetypes.map(a => a.archetype).join(", ");
    return `You are a Colour Theorist. Construct a complete colour system for this brand.

**CRITICAL RULES:**
- AVOID primary blue + orange/warm accent. This is the most overused SaaS palette (Stripe, Slack, Asana, Intercom, and thousands more).
- AVOID cyan + white minimalism (Coinbase, Zoom, Twilio territory).
- Choose unexpected, differentiated colour stories. Examples of unique combinations: violet+teal, amber+indigo, rose+slate, emerald+plum, coral+navy, lime+charcoal, rust+teal, graphite+copper.
- For neutral/utility brands: consider slate+emerald, charcoal+amber, graphite+copper instead of grey+blue.
- For creative brands: avoid purple+pink (Figma, Canva, Notion default). Try ochre+teal, rust+forest, brass+slate.
- Every palette must pass the "screenshot test": if someone screenshots your target page and posts it, the colour combination should be instantly recognisable and NOT look like a competitor.
- Avoid "dark mode = inverted" — dark mode should shift hues warmer/cooler, not just invert.

**Brand Context:**
- Archetypes: ${archetypes}
- Emotional Territory: ${bso.strategy.emotionalTerritory}
- Personality: ${describeSpectrum(bso.strategy.personalitySpectrum)}
- Values: ${bso.strategy.brandValues.join(", ")}

**Generate:**
1. **Harmony Type**: Choose from complementary, split_complementary, triadic, analogous, or monochromatic
2. **Primary Colour** (60% usage): The main brand colour with hex + HSL
3. **Secondary Colour** (30% usage): Supporting colour
4. **Accent Colour** (10% usage): For CTAs and highlights
5. **Full Neutral Scale** (50-950): Greyscale with subtle hue tint from primary
6. **Semantic Colours**: success (green), warning (amber), error (red), info (blue)
7. **Surface Colours** (1-5): Layered surfaces for depth
8. **Text Colours**: primary, secondary, disabled
9. **Dark/Light Mode Pairs**: Every token must have both variants
10. **WCAG 2.1 AA Compliance**: Check all text/background combinations
11. **CSS Custom Properties + Tailwind Config + SCSS Variables** output`;
  },

  // ─── Stage 4: Typography ──────────────────────────────
  typography: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `You are a Typographer. Select and scale fonts for this brand.

**Brand Context:**
- Archetypes: ${bso.strategy.personalityArchetypes.map(a => a.archetype).join(", ")}
- Modern/Classic: ${bso.strategy.personalitySpectrum.modernVsClassic}/100 modern
- Playful/Serious: ${bso.strategy.personalitySpectrum.playfulVsSerious}/100 playful
- Category: ${bso.product.category}

**Generate:**
1. **Display Font** — for headings, hero text, brand name in logo
2. **Text Font** — for body copy, UI, documentation
3. **Mono Font** (optional) — for code-adjacent products
4. **Type Scale** — Major Third (1.25) ratio, or custom based on personality
5. **Font Pairing Rationale** — why these fonts work together
6. **Google Fonts embed code** or @font-face declarations
7. **CSS Custom Properties + Tailwind Config** output

AVOID OVERUSED DEFAULTS: Inter, Roboto, Helvetica Neue, Arial, Open Sans, Lato, Poppins, Montserrat, system-ui.
- For DISPLAY fonts: choose something with genuine character (variable, geometric with quirks, serif revival, or unique sans). Avoid "safe" choices.
- For BODY fonts: consider non-default options like Space Grotesk, Satoshi, ABC Diatype, Founders Grotesk, or premium Google Fonts alternatives (DM Sans, Sora, Plus Jakarta Sans).
- For MONO fonts: avoid JetBrains Mono unless the brand is specifically for developers. Consider departures from mono norms.
Prefer variable fonts when possible.
Ensure minimum 1.5 line-height for body, max 75 chars per line.`;
  },

  // ─── Stage 5: Logo ───────────────────────────────────
  logo: (ctx: PromptContext) => {
    const { bso } = ctx;
    const cs = bso.visualIdentity.colourSystem;
    const t = bso.visualIdentity.typography;
    return `You are a Logo Designer. Generate logo concepts for this brand.

**Brand Context:**
- Name: ${bso.product.name}
- Category: ${bso.product.category}
- Archetypes: ${bso.strategy.personalityArchetypes.map(a => a.archetype).join(", ")}
- Emotional Territory: ${bso.strategy.emotionalTerritory}
- Primary Colour: ${cs?.primaryColour || "from colour system"}
- Accent Colour: ${cs?.accentColour || "from colour system"}
- Display Font: ${t?.displayFont.name || "from typography system"}

**Generate:**
1. **Logo Typology Recommendation** — wordmark, lettermark, icon+wordmark, abstract, combination, or emblem
2. **12 Concept Descriptions** — detailed visual directions with prompts
3. **Top 4 Refinements** — geometric precision, stroke consistency, simplification
4. **Lockup Compositions** — horizontal, stacked, icon-only, wordmark-only
5. **Dark/Light/Mono Variants** — full colour, reversed, single colour, monochrome

Use this prompt template for each concept:
"[Style descriptor] logo mark for [category] brand. [Geometric/organic] composition. Concept: [metaphor]. Colours: [primary] and [accent]. Professional, scalable, memorable."

Quality checks: legible at 16px, reproducible in 1-colour, works on any background, distinct from competitors.`;
  },

  // ─── Stage 5: Iconography ────────────────────────────
  iconography: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `Generate a cohesive icon system for this brand.

**Define:**
1. Stroke weight (heavy/medium/light) — match archetype energy
2. Corner radius (sharp/medium/round) — match brand personality
3. Fill approach (outline/filled/duotone) — match UI aesthetic
4. 24 core UI icons with descriptions (navigation, actions, status, media)
5. 12 feature/product-specific icons
6. App icon / favicon at all platform sizes (16, 32, 64, 128, 180, 192, 512px)

Use viewBox="0 0 24 24". Ensure cultural neutrality and global legibility.`;
  },

  // ─── Stage 5: Illustration ───────────────────────────
  illustration: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `Define the illustrative visual language for this brand.

**Select style based on archetype:** ${bso.strategy.personalityArchetypes.map(a => a.archetype).join(", ")}
- Geometric Abstract → Sage, Ruler
- Isometric → Creator, Explorer
- Character → Everyman, Jester, Caregiver
- 3D/Material → Magician, Lover
- Editorial/Collage → Outlaw, Hero
- Line Art/Sketch → Caregiver, Innocent

**Define:**
1. Selected style with rationale
2. Consistency parameters (stroke weight, colour palette, perspective, character proportions)
3. Scenes: 3-5 marketing illustrations, 3-5 onboarding, 3-5 empty states

Stroke weight must match iconography. Use only BSO colour palette colours.`;
  },

  // ─── Stage 5: Motion ────────────────────────────────
  motion: (ctx: PromptContext) => {
    const { bso } = ctx;
    return `Define the motion and animation language for this brand.

**Based on brand personality:**
- Duration: snappy (100-150ms), quick (200-300ms), deliberate (400-600ms), or languid (600ms+)
- Easing: sharp cubic-bezier, spring-based, or smooth ease-out
- Style: functional only, personality-forward, or expressive

**Generate:**
1. CSS/JS motion token set (duration, easing, delay variables)
2. 5 reference animations with code snippets (page transition, button state, card hover, loading, toast)
3. Logo sting animation specification

Respect prefers-reduced-motion. Never exceed 500ms for functional UI animations.`;
  },

  // ─── Stage 6: Copywriting ────────────────────────────
  copywriting: (ctx: PromptContext) => {
    const { bso } = ctx;
    const tone = bso.strategy.toneOfVoice;
    return `You are a Brand Copywriter. Write the complete verbal identity.

**Brand Context:**
- Name: ${bso.product.name}
- Positioning: ${bso.strategy.positioning}
- Tone: ${describeTone(tone)}
- Emotional Territory: ${bso.strategy.emotionalTerritory}
- Values: ${bso.strategy.brandValues.join(", ")}

**CRITICAL RULE — The Competitor Test:**
Every tagline and headline must pass: "Could any competitor swap in their name and this still makes sense?"
If yes, reject it. The message must be SPECIFIC to this brand, this audience, this positioning.

Example FAIL: "The future of prompt management" — any prompt tool can claim this.
Example PASS: "From blank page to production prompt" — communicates the specific value (speed, output orientation, not just management).

**Generate:**
1. **20 Tagline Candidates** across 5 approaches (benefit-led, emotion-led, imperative, question, positioning condensed). Score each 1-10 on memorability, originality, brand fit. Explain why each passes the Competitor Test.
2. **Messaging Hierarchy**: Hero headline (5-10 words), sub-headline (15-25 words), body description (40-60 words), primary CTA (2-4 words), feature headlines (3-5).
3. **Tone Examples**: Same message in 3 tones — on-brand, too formal, too casual
4. **Microcopy**: Button labels, error messages, empty states, tooltips, success states, loading states
5. **Brand Vocabulary**: Words we own, words we avoid, naming conventions

NEVER use: "revolutionary", "game-changing", "seamless", "innovative", "cutting-edge", "disruptive", "next-gen", "world-class", "powerful", "robust", "next-generation"."`;
  },
};

// ─── Register all templates ──────────────────────────────────

export function registerAllTemplates(engine: PromptEngine): void {
  for (const [module, template] of Object.entries(templates)) {
    engine.register(module, template);
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function describeTone(tone: { formalToCasual: number; seriousToWitty: number; authoritativeToApproachable: number; conventionalToIrreverent: number }): string {
  const casualness = tone.formalToCasual > 50 ? "casual" : "formal";
  const wit = tone.seriousToWitty > 50 ? "witty" : "serious";
  const approach = tone.authoritativeToApproachable > 50 ? "approachable" : "authoritative";
  const convention = tone.conventionalToIrreverent > 50 ? "irreverent" : "conventional";
  return `${casualness}, ${wit}, ${approach}, ${convention}`;
}

function describeSpectrum(spectrum: { excitingVsCalm: number; modernVsClassic: number; playfulVsSerious: number; accessibleVsExclusive: number; boldVsUnderstated: number }): string {
  const parts: string[] = [];
  if (spectrum.excitingVsCalm > 60) parts.push("exciting");
  else if (spectrum.excitingVsCalm < 40) parts.push("calm");
  if (spectrum.modernVsClassic > 60) parts.push("modern");
  else if (spectrum.modernVsClassic < 40) parts.push("classic");
  if (spectrum.playfulVsSerious > 60) parts.push("playful");
  else if (spectrum.playfulVsSerious < 40) parts.push("serious");
  if (spectrum.accessibleVsExclusive > 60) parts.push("accessible");
  else if (spectrum.accessibleVsExclusive < 40) parts.push("exclusive");
  if (spectrum.boldVsUnderstated > 60) parts.push("bold");
  else if (spectrum.boldVsUnderstated < 40) parts.push("understated");
  return parts.join(", ") || "balanced";
}
