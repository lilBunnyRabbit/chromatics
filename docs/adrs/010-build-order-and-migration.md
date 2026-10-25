# ADR-010: Build order and studio migration

**Date:** 2026-10-18
**Status:** Accepted

> **Revision 2026-10-21 (grill 78, [ADR-016](./016-studio-on-the-package.md)):** the owner chose alternative 4: the app holds package classes directly, and the DSL follows the package with no backwards compatibility. The baseline dump stays, but as a reviewed diff rather than a parity gate.

## Context

About 30 models are culori-backed in the studio today; about 70 more are hand-written custom modes or stubs. Four earlier rewrites built about 12 of 60 planned models before stalling. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 14.

## Decision

- **Core first, each with the full test matrix (ADR-008):** `Color` base, router, parse / format, and `Xyz65`, `Xyz50`, `Srgb`, `LinearSrgb`, `Srgb8`, `Oklab`, `Oklch`, `Lab`, `Lch`, `Hsl`, `Hsv`, `Hwb`, `DisplayP3`.
- **Then by family:**
  1. Wide-gamut RGB (Rec2020, A98, ProPhoto, ACES, …).
  2. Perceptual (Luv, Jzazbz, ICtCp, okhsl / okhsv, HSLuv, …).
  3. Appearance (CAM16, HCT, CIECAM02).
  4. Video, print, catalogs.
- **Studio migration: big bang at parity.** Culori stays in the app until the package covers everything the app uses; one PR then switches. The culori baseline dump (ADR-008) is the gate.

## Alternatives Considered

1. The culori parity set first: the app could drop culori sooner, but there's no foundation-first ordering.
2. One family completely at a time.
3. Incremental swaps behind `registry.ts` with culori as fallback: a long half-and-half period.
4. Rewriting the app engine directly on the package classes.

## Consequences

- The studio sees no benefit until parity.
- The switch PR is large; the baseline dump is what makes it reviewable.
