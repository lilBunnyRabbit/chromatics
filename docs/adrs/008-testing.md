# ADR-008: Testing

**Date:** 2026-10-18
**Status:** Accepted (round-trip epsilon pending)

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
