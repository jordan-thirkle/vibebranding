---
name: color-harmony
description: Use ONLY when constructing colour palettes for VibeBranding. Contains formal colour theory algorithms (harmony types, 60-30-10 distribution, contrast calculations, colour psychology mappings, WCAG 2.1 AA compliance checking).
---

# Colour Harmony & Theory

## Colour Psychology → Archetype Mapping

| Archetype | Primary Hue Families | Mood |
|-----------|---------------------|------|
| Hero | Bold reds, royal blues | Strength, courage |
| Creator | Vibrant spectrum, teals | Imagination, innovation |
| Explorer | Earth tones, deep blues | Adventure, freedom |
| Sage | Deep navy, charcoal, muted tones | Wisdom, clarity |
| Outlaw | Black, deep reds, acid greens | Rebellion, edge |
| Magician | Purples, magentas, golds | Transformation, wonder |
| Everyman | Warm neutrals, blues | Belonging, trust |
| Lover | Soft pinks, rich reds, creams | Intimacy, beauty |
| Jester | Bright primaries, orange, yellow | Joy, playfulness |
| Caregiver | Soft greens, warm creams | Nurturing, safety |
| Ruler | Deep purples, golds, blacks | Power, prestige |
| Innocent | Pastels, clean whites, sky blues | Purity, simplicity |

## Harmony Type Selection

### Complementary (180° apart on colour wheel)
- High contrast, high energy
- Pairs: Blue/Orange, Red/Green, Purple/Yellow
- Best for: Hero, Jester, Outlaw

### Split-Complementary
- Base colour + two colours adjacent to its complement
- Less tension than complementary, more nuance
- Best for: Explorer, Creator

### Triadic (120° apart)
- Three evenly spaced colours
- Vibrant, balanced
- Best for: Magician, Everyman

### Analogous (adjacent on wheel)
- 3-5 colours next to each other
- Harmonious, sophisticated
- Best for: Sage, Lover, Caregiver

### Monochromatic
- Single hue, varied saturation and lightness
- Refined, authoritative
- Best for: Ruler, Innocent

## 60-30-10 Rule Calculator

```
Primary (60%): Backgrounds, large surfaces, main brand presence
Secondary (30%): Sections, cards, navigation, secondary UI
Accent (10%): CTAs, links, highlights, interactive elements
```

## WCAG 2.1 AA Contrast Formula

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where L = relative luminance:
L = 0.2126 * R + 0.7152 * G + 0.0722 * B

Where R, G, B are linearized:
if channel <= 0.04045: linear = channel / 12.92
else: linear = ((channel + 0.055) / 1.055) ^ 2.4
```

Requirements:
- Normal text (<18px or <14px bold): minimum 4.5:1
- Large text (≥18px bold or ≥24px): minimum 3:1
- AAA (enhanced): 7:1 normal, 4.5:1 large

## Simultaneous Contrast Check

When two colours are adjacent, their perceived appearance shifts. Avoid:
- High-chroma complements adjacent (optical vibration)
- Equal-value colours adjacent (edges blur)
- Always test adjacent pairs from the generated palette

## Dark/Light Mode Pairing Rules

For each light-mode colour token, generate a dark-mode variant:
- Light backgrounds → Dark backgrounds (luminance inversion)
- Preserve the hue but adjust lightness
- Maintain WCAG contrast with text on both modes
- Never simply invert colours; redesign for each mode's perceptual context

## Neutral Scale Construction

Generate a full 50-950 scale using HSL:
- Hue: Match the brand primary's hue (or use a true neutral)
- Saturation: Reduce gradually (50: ~2%, 950: ~5%)
- Lightness: 50 → L~97%, 100 → L~95%, 200 → L~90%, ... 950 → L~5%
