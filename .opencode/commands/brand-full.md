---
description: Run the full 9-stage VibeBranding pipeline from Discovery through Export
agent: build
model: google/gemini-2.5-pro
---

Load the brand-generation skill, then execute the full VibeBranding 9-stage pipeline using the provided input.

1. **Discovery**: Run @brand-discovery to gather product context
2. **Strategy**: Run @brand-strategist to define brand foundation
3. **Naming**: Run @brand-namer to generate and validate names
4. **Colour & Typography**: Run @color-theorist and @typographer in parallel
5. **Logo & Visual Identity**: Run @logo-designer, then @iconographer, @illustrator, @motion-designer sequentially
6. **Verbal Identity**: Run @copywriter
7. **Consistency Check**: Run @consistency-checker for full BCE validation
8. **Export**: Run @asset-exporter to generate all token files and brand kit

After each stage, present results to the user for validation before proceeding.

$ARGUMENTS
