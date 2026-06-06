---
description: Run all Visual Identity stages — Colour, Type, Logo, Icons, Illustration, Motion (Stages 4-5)
agent: build
model: google/gemini-2.5-pro
---

Run Stages 4 and 5 of the VibeBranding pipeline — the complete Visual Identity generation.

1. **Colour System**: Run @color-theorist (load color-harmony skill)
2. **Typography**: Run @typographer (load typographic-systems skill) — can run in parallel with Colour
3. **Logo**: Run @logo-designer with full BSO context
4. **Iconography**: Run @iconographer
5. **Illustration**: Run @illustrator
6. **Motion**: Run @motion-designer

Present the visual identity for user validation. Allow iterative refinement ("make it bolder", "warmer colours", etc.).

$ARGUMENTS
