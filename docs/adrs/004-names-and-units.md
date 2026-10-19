# ADR-004: Names and units

**Date:** 2026-10-18
**Status:** Accepted

## Context

Class names, channel names and channel units are the first words a user types; changing any of them after publishing is breaking. The repo bans snake_case identifiers. CIE xyY (`x y Y`) and CAM16 (`J C h Q M s`) use case-sensitive letters. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 5.

## Decision

- **Classes are PascalCase words:** `Oklch`, `Oklab`, `Srgb`, `LinearSrgb`, `Srgb8`, `DisplayP3`, `Rec2020`, `Hsl`, `Hsv`, `Hwb`, `Lab`, `Lch`, `Xyz50`, `Xyz65`, `Xyy`, `Cam16`, `Hct`, `Hsluv`, `Ycbcr`, `Ictcp`, `Cmyk`.
- **Channels are the spec's letters, case-sensitive:** `l c h`, `a b`, `x y Y`, `J C h Q M s`. This is the one deliberate exception to camelCase: channels are math symbols, and formulas read 1:1.
- **Units are the spec's ranges, with percentages as 0–1 fractions:** `new Hsl(30, 1, 0.5)`, `new Cmyk(0, 0.5, 1, 0.1)`, Oklch L 0–1 (CSS), Lab L 0–100 (CIE), hue in degrees, alpha 0–1 (0–255 on byte models). CSS strings convert `%` on parse and format.

## Alternatives Considered

1. Standard capitalization (`OKLCH`, `YCbCr`, `HSLuv`): recognisable but irregular.
2. All-caps acronyms.
3. Lowercase channels with renamed collisions (`xyy.luminance`).
4. Descriptive channel names with letter aliases: doubles autocomplete.
5. Percent 0–100: matches pasted CSS, diverges from every formula.
6. Lab L as 0–1: non-standard.

## Consequences

- `Ycbcr`, `Ictcp`, `Hsluv` look unfamiliar to people who know them as YCbCr, ICtCp, HSLuv; docs and search keywords should carry the standard spelling.
- Capital-letter fields (`c.Y`, `c.J`) read like constants; JSDoc on each says what it is.
- `new Hsl(30, 100, 50)` is a likely user mistake; it stays valid, since out-of-range values are stored raw (ADR-003).
