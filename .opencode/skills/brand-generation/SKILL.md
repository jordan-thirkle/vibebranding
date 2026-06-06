---
name: brand-generation
description: Use ONLY when executing the full VibeBranding brand generation workflow. Contains the 9-stage methodology, BSO schema reference, module chaining rules, and validation gate logic. Load this before orchestrating any brand generation pipeline.
---

# VibeBranding — Brand Generation Workflow

## The 9-Stage Pipeline

When generating a brand, follow this exact sequence. Each stage inherits the accumulated BSO from all previous stages:

### Stage 1 — Discovery
- **Agent**: `brand-discovery`
- **Input**: Product description, audience, optional references
- **Output**: Brand Discovery Report, Audience Persona Profile, Positioning Statement
- **Writes to**: `bso.product`, `bso.strategy.positioning`

### Stage 2 — Strategy
- **Agent**: `brand-strategist`
- **Input**: Discovery data from BSO
- **Output**: Archetypes, Personality Spectrum, Emotional Territory, Values, Tone of Voice
- **Writes to**: `bso.strategy.*`

### Stage 3 — Naming
- **Agent**: `brand-namer`
- **Input**: Product info + strategy from BSO
- **Output**: Ranked name candidates, validation results
- **Writes to**: `bso.verbal_identity.naming`

### Stage 4 — Colour & Typography
- **Agent**: `color-theorist` + `typographer` (parallel)
- **Input**: Strategy archetypes + personality from BSO
- **Output**: Colour system + type system with tokens
- **Writes to**: `bso.visual_identity.colour_system`, `bso.visual_identity.typography`

### Stage 5 — Logo & Visual Identity
- **Agent**: `logo-designer` → `iconographer` → `illustrator` → `motion-designer`
- **Input**: Full visual foundation from BSO
- **Output**: Logo, icons, illustration style, motion language
- **Writes to**: `bso.visual_identity.logo`, `.iconography`, `.illustration_style`, `.motion_language`

### Stage 6 — Verbal Identity
- **Agent**: `copywriter`
- **Input**: Strategy + naming from BSO
- **Output**: Taglines, messaging, tone examples, microcopy, vocabulary
- **Writes to**: `bso.verbal_identity.*`

### Stage 7 — Application Assets
- **Agent**: `general` (or `asset-exporter` for asset specs)
- **Input**: Complete BSO
- **Output**: Asset specifications and preview descriptions

### Stage 8 — Guidelines
- **Agent**: `asset-exporter` + `docs-writer`
- **Input**: Complete BSO
- **Output**: Brand guidelines document structure

### Stage 9 — Export & Handoff
- **Agent**: `asset-exporter`
- **Input**: Complete BSO
- **Output**: All token files, asset manifest, brand kit ZIP

## BSO Schema Reference

The BSO is the central data structure. All modules read and write to it:

```typescript
interface BrandStateObject {
  product: {
    name: string
    tagline: string
    description: string
    category: string
    audience: { demographics: string; psychographics: string; techSophistication: string }
    competitors: Array<{ name: string; url: string; notes: string }>
  }
  strategy: {
    positioning: string
    personality_archetypes: Array<{ archetype: string; weight: number; rationale: string }>
    brand_values: string[]
    tone_of_voice: {
      formalToCasual: number
      seriousToWitty: number
      authoritativeToApproachable: number
      conventionalToIrreverent: number
    }
    emotional_territory: string
  }
  visual_identity: {
    logo: any
    colour_system: any
    typography: any
    iconography: any
    illustration_style: any
    motion_language: any
  }
  verbal_identity: {
    naming: any
    taglines: any[]
    messaging_hierarchy: any
    copy_examples: any
  }
  consistency_report?: any
}
```

## Validation Gates

Between stages, run the BCE (`consistency-checker` agent):
- After Stage 2: Validate strategy coherence
- After Stage 5: Validate visual coherence
- After Stage 6: Validate verbal coherence
- After Stage 8: Full validation before export

## Parallelism Rules
- Stages 4's colour + typography can run in parallel (they share the same BSO input)
- Stages 5's iconographer + illustrator can run in parallel after logo is done
- All other stages are sequential (each depends on previous stage output)

## Iteration
- "Differential updates": If user says "make the logo more geometric", only re-run logo-designer, not the full pipeline
- Always preserve the existing BSO and only modify the targeted section
- After any change, re-run BCE on the affected sections only
