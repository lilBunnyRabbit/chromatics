# ADR-013: Lab-like and tristimulus spaces

**Date:** 2026-10-20
**Status:** Accepted

## Context

This ADR covers the studio models still missing in the parity table's lab-like and tristimulus rows. Sources and decisions are in the [brainstorm](../brainstorm/2026-10-18-own-color-library.md), grills 65–67 plus the model-specific choices after them.

## Decision

- **CIE spaces from CIE 015:2018:**
  - `Lab65` / `Lch65`: §8.2.1 on the D65 white.
  - `Xyy`: §7.3.
  - `Uvy76`: §8.1.
  - `Uvy60` and `Uvw64`: Annex A.4.
  - At black (a zero denominator) the chromaticities are 0. A zero `y` / `v` with Y ≠ 0 converts to black, as in colour-science.
  - Below |Y| 1e-12 (the grill 45 floor), `Uvw64`'s U\* and V\* are dropped.
- **`Lms`:** Hunt-Pointer-Estevez, normalised to the equal-energy white (grill 66).
- **Opponent spaces** (next commit): `Ipt` (Ebner & Fairchild 1998), `HunterLab` (1966 Ka / Kb on our D65), `Din99` / `Din99Lch` (colour-science vectors), `Din99o` / `Din99oLch` (culori parity only, flagged), and `Xyb` (libjxl; B = S, negatives keep their sign).
- **Names:** grills 64 and 65.

## Alternatives Considered

- **The studio's ids `ucs` / `ucs60` / `uvw`:** ambiguous.
- **The white's chromaticity for black:** the studio's `xyy` does this; colour-science stopped.
- **Several LMS bases.**
- **All five DIN99 variants.**

## Consequences

- Chromaticity models reach astronomically large XYZ near y = 0, so their totality sweep stays in the reference ranges (`realistic: 1`).
- Conversions that throw a RangeError are skipped by the harness round trip (ADR-008 revision).
