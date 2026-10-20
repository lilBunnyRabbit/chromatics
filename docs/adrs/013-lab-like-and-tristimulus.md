# ADR-013: Lab-like and tristimulus spaces

**Date:** 2026-10-20
**Status:** Implemented

> **Revision 2026-10-20, implemented:**
> - **DIN99o** uses culori's exact constants (100 / ln 1.39, 1 / 0.0435). The shared DIN99 core reproduces colour-science's DIN99 and DIN99b vectors; DIN99b differs from DIN99o only in c1 and c5. DIN99o itself is checked against culori only.
> - **XYB** matches culori to 1e-12 once culori's b (S′ − Y′) is mapped back to libjxl's B = S′.
> - **Hunter Lab** drops a and b below |Y| 1e-12, where they divide by an underflowing √Y.
> - **Okhsl / Okhsv:** once the hue is zeroed, the gamut shape is read along hue 0, so s and h describe one color at tiny L.
> - **DIN99 and the chromaticity models** use a 1× totality sweep. Their inverses are exponential or blow up near y = 0.
>
> **Revision 2026-10-20 (fix):** `Uvw64` treats |W\*| < 1e-12 like W\* = 0. U\*/W\* past that outruns the precision of X + 15Y + 3Z, so the chromaticity couldn't round-trip. Found by fast-check on JSC.

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
