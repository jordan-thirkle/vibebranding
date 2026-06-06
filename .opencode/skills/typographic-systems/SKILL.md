---
name: typographic-systems
description: Use ONLY when selecting and scaling typography for VibeBranding. Contains type scale formulas (Major Third, Perfect Fourth), font pairing rules, x-height compatibility tables, and legibility thresholds.
---

# Typographic Systems & Scales

## Type Scale Formulas

### Major Third (1.25) — Default
Best for: Most brands, balanced hierarchy
```
base × 1.25^n
Example (base 16px):
xs: 12.8 → 12px
sm: 14px
base: 16px
lg: 20px
xl: 25px
2xl: 31.25px
3xl: 39px
4xl: 48.83px
```

### Perfect Fourth (1.333) — Bold brands
Best for: Hero, Jester, Outlaw, Explorer
```
base × 1.333^n
More dramatic jumps between sizes
```

### Augmented Fourth (1.414) — Editorial
Best for: Sage, Lover, Magician (editorial/expressive brands)
```
base × 1.414^n
Largest jumps, most dramatic hierarchy
```

### Minor Third (1.2) — UI-Dense
Best for: Technical tools, dashboards, data-heavy UIs
```
base × 1.2^n
Subtle hierarchy for information-dense layouts
```

## Font Pairing Rules

### X-Height Compatibility
- Paired fonts should have similar x-height (within 10%)
- If x-heights differ significantly, the smaller will appear visually smaller even at same font-size
- Test by overlaying text in both fonts and checking x-height alignment

### Contrast Balance
- Display font should contrast with text font
- Contrast through: weight (bold vs regular), style (serif vs sans), or width (wide vs narrow)
- Avoid pairing fonts that are too similar (creates visual dissonance)

### Personality Cohesion
- Both fonts should share the same "era" or design philosophy
- Geometric sans display + humanist sans text = cohesive
- Display serif + geometric sans text = contrasting but balanced
- Comic/Casual display + formal text = dissonant

## Font Classifications

### Geometric Sans
- Circular forms, uniform stroke width
- Examples: Futura, Poppins, DM Sans, Space Grotesk, Satoshi
- Best for: Modern, tech, forward-thinking brands

### Humanist Sans
- Organic proportions, varied stroke width, calligraphic roots
- Examples: Source Sans, Public Sans, Inter Display, Plus Jakarta Sans
- Best for: Approachable, human-centric brands

### Grotesque/Neo-Grotesque
- Squarish forms, minimal stroke contrast
- Examples: Inter, Helvetica Neue, Roboto
- Best for: Neutral, system-level typography (often overused)

### Transitional Serif
- Moderate stroke contrast, bracketed serifs
- Examples: Merriweather, Source Serif, Libre Baskerville
- Best for: Authority, heritage, trust

### Display/Variable
- Extreme personality, often experimental
- Examples: Clash Display, Cabinet Grotesk, Obviously
- Best for: Expressive, editorial, brand-forward moments

## Legibility Thresholds

- **Minimum body text size**: 16px (1rem) on web
- **Minimum label size**: 12px (0.75rem) — must be short text only
- **Maximum line length**: 75 characters (including spaces) for body text
- **Minimum line height**: 1.5 for body text, 1.2 for headings
- **Letter spacing**: Never negative for body text; headings can use -0.02em to -0.05em

## Font Loading Strategy

- Prefer variable fonts: single file, all weights, smaller payload
- Use `font-display: swap` for all web fonts
- Provide complete fallback stacks:
  - Sans: `'Display Font', 'Text Font', system-ui, -apple-system, sans-serif`
  - Serif: `'Display Font', 'Text Font', Georgia, 'Times New Roman', serif`
  - Mono: `'Mono Font', 'Cascadia Code', 'Fira Code', monospace`

## Output Format

For each font selection, provide:
```
Font: [Name]
Type: [Display / Text / Mono]
Classification: [Geometric Sans / Humanist Sans / etc.]
Source: [Google Fonts / Adobe Fonts / Self-hosted]
Weights needed: [400, 500, 700, etc.]
Variable: [Yes / No]
Fallback stack: [CSS font-family value]
Rationale: [Why this font for this brand]
```
