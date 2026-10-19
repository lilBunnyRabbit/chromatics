# ADR-006: Parsing, formatting, equality

**Date:** 2026-10-18
**Status:** Accepted

> **Revision 2026-10-19:** `looksSame` threshold is **deltaEOk < 0.02**, per CSS Color 4 §13.2 ("For the OkLCh color space, one JND is an OkLCh difference of 0.02"). It's conventional rather than measured: ΔE2000 ≈ 2 rescaled by Oklab's 0–1 lightness range. Every implementation uses the same value (colorjs.io `toGamut.js`, culori `toGamut`, ColorAide `fit_minde_chroma.py`, Stylo `gamut.rs`). Owner delegated the value.

## Context

Culori's `parse` covers CSS Color 4; `formatCss` falls back to `rgb()` for models CSS doesn't know, losing the model. The 2025 attempt had a priority/`canParse` parser registry and a paste-to-detect idea. A global parse must know every syntax, so it can't tree-shake. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 7, 8.

## Decision

- **Per-class parse:** `Oklch.parse(str)` reads only Oklch syntax and returns `Oklch`, throwing otherwise (ADR-003). `Oklch.tryParse(str)` returns `Optional<Oklch>`.
- **Any-syntax parse:** `parse(str)` from `@lilbunnyrabbit/chromatics/all` returns `Color`.
- **`toString()` is lossless in our syntax** (`cam16(50 30 120)`) and round-trips through `parse`. **`toCss()` is always valid CSS**, converting when the model has no CSS form. For CSS-native models the two agree.
- **Hex belongs to `Srgb8`:** `Srgb8.parse('#ff8000')`; `toString()`, `toCss()`, `toHex()` give `'#ff8000'`; `parse('#ff8000')` returns `Srgb8`. CSS `rgb()` parses to float `Srgb`.
- **Equality:** `a.equals(b)` is exact (every channel `===`). Perceptual sameness is `a.to(Oklab).looksSame(b.to(Oklab))`, deltaEOk below a JND, same-model typed like every two-color method.

## Alternatives Considered

1. Per-class parse that converts any syntax: drags other parsers into each bundle.
2. Only a global parse: always ships every parser.
3. CSS Color 5 `color(--cam16 …)`: looks like CSS, but browsers won't render it without `@color-profile`.
4. `toString()` always valid CSS: loses the model.
5. `toHex()` on `Srgb` or on every color: convenient, but outside the class rule or dragging the sRGB chain everywhere.
6. Epsilon equality: useful after conversions; the owner chose exact + perceptual.

## Consequences

- `toString()` of a non-CSS model is not valid CSS; someone will paste it into a stylesheet. `toCss()` is the documented answer.
- The most common output, hex, is `c.to(Srgb8).toHex()`.
- `equals` is rarely true after a conversion; that's intended.
