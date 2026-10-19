# ADR-008: Testing

**Date:** 2026-10-18
**Status:** Implemented

> **Revision 2026-10-19:** round-trips pass when **`|a − b| ≤ 1e-13 + 1e-12·|b|`** per channel. A mixed bound, because relative error grows near black with the sRGB gamma slope. Measured on V8 and JSC with 64-bit matrices: 4.4e-14 / 5.0e-14 absolute, 3.7e-12 / 4.2e-12 relative on channels above 0.01. A model with an iterative inverse (HCT, CAM16) declares a looser bound with its reason beside the model. For comparison: ColorAide asserts 10 significant digits, colour-science 1e-7 (loose enough to hide a 10-decimal-matrix bug at 6e-8). Owner delegated the value.

> **Revision 2026-10-19: harness and core oracles** ([brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 20, 21)
>
> - **One shared harness:** `describeModel(Model, spec)` runs every matrix row from the model's channel metadata, edges, domain, fixtures and strings. Model-specific cases sit beside it. The harness has its own test with deliberately broken models.
> - **Core models use no Python.** References are published spec values at their own precision (CSS Color 4 examples and tables, Ottosson's table, CIE / ASTM worked values). A culori grid dump (Bun script, JSON) is a labelled **cross-check, not a reference**, and is also the migration-parity baseline. Whether Python returns for later families is open.
>
> **Revision 2026-10-19: tolerance shape, conditioning, totality** (grills 29–32)
>
> - Round trips: `|aᵢ − bᵢ| ≤ 1e-13 + 1e-12·maxⱼ|bⱼ|` (relative to the largest non-hue channel). Hue differences are weighted by the model's colorfulness (chroma; `s·min(l, 1 − l)` for HSL; `s·v` for HSV; `1 − w − b` for HWB), so they're compared on the rectangular projection. A channel that doesn't affect the color (hue of a grey, HSL saturation at black or white) is skipped.
> - Where the source-space check fails, the round trip passes if its residual in the neighbour space passes (`back.to(N)` vs `c.to(N)`). This covers ill-conditioned regions and the achromatic band of ADR-003.
> - 3× the reference ranges are tested again for the rectangular models among themselves and for out-of-gamut sRGB through HSL.
> - References: tolerance = max(published half-digit, WPT epsilon) + the spread from the published input's own rounding; WPT inputs carry none.
> - Totality: every conversion of a finite color returns a finite color or throws a `RangeError`, and never throws within 1e6× the reference ranges (no subnormal magnitudes).

## Context

Every hand-written generation died with no real tests and unverified, AI-drafted math. The owner: _"This needs to be bulletproof with really in depth tests of every model boundries, conversions, everything."_ `Math.pow` / `cbrt` / `exp` are implementation-approximated in ECMAScript, so V8 and JavaScriptCore can differ in the last bit. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 9, 10. The rules in CLAUDE.md (_Numbers need sources_, per-model matrix) apply.

## Decision

- **Runner: Vitest, run on node (V8) and bun (JSC).**
- **Oracles per model, as offline fixtures.** Each model names its source: colour-science, hsluv.org's tests, material-color-utilities (HCT), Ottosson's reference code (Oklab, okhsl, okhsv), CSS Color 4 examples, published standard tables. A generator script (`uv` + Python where needed) writes JSON fixtures carrying source, version, function, and `precision`. Tests read JSON only.
- **Tolerances come from the source:** reference checks use half the last published digit (`fixture.precision`); round-trips use a tight relative epsilon.
- **Inputs in three layers:** hand-written boundaries / corners / degenerate cases; a deterministic grid over each model's domain; property-based round-trips with fast-check (fixed seed in CI, shrinking on failure). Each model ships a domain generator.
- **Per-model matrix** (CLAUDE.md): channel boundaries, degenerate input, every direct edge both ways, round-trips, reference vectors, parse ↔ format.
- **Migration parity:** a culori baseline dump guards the studio's golden hexes until the switch (ADR-010).

## Alternatives Considered

1. colorjs.io live in tests: one toolchain, but it's an implementation, not a reference.
2. Published tables only: authoritative, sparse.
3. One global epsilon, or ULP-based comparison.
4. Boundaries only, or a grid without fast-check.
5. bun test only: blind to V8.

## Consequences

- Regenerating fixtures needs a Python environment; a fixture can be wrong while citing a source.
- About 100 domain generators to write.
- CI time roughly doubles with two engines.
