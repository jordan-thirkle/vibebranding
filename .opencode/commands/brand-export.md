---
description: Export the brand kit — tokens, assets, guidelines (Stages 8-9)
agent: build
model: google/gemini-2.5-pro
---

Run the Export stage of VibeBranding. Run @asset-exporter with the current BSO to generate:

1. CSS custom properties file
2. Tailwind config extension
3. SCSS variables
4. Figma styles JSON
5. Brand guidelines markdown (10 sections)
6. Brand manifest YAML
7. Asset pack manifest

Validate with @consistency-checker before final export.

$ARGUMENTS
