# ADR-002: Conversion graph

**Date:** 2026-10-18
**Status:** Accepted

## Context

Every earlier iteration had conversions but no routing ("Indirect conversions are currently not supported", 2025). The studio's `registry.ts` has a global edge graph + BFS, filled by import side effects, which is why `sideEffects: ["**/models/**"]` exists (the prod build once crashed with `No constructor registered for oklch`). Some pairs have a direct formula beside the parent route (Hsl ↔ Hsv). [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 3.

## Decision

- **Edge graph + BFS, one internal registry.**
- **Edges are static data on the class**: `static readonly edges = [edge(Srgb, srgbToHsv, hsvToSrgb), edge(Hsl, hslToHsv, hsvToHsl)]`. The first `to()` walks outward from the classes it touches, fills the registry, caches the path. Nothing registers on import.
- **Each edge is declared once, on the more derived model**; the registry adds the reverse. Declaring both sides is a circular ES-module import (`Cannot access 'Hsl' before initialization`).
- **Call forms:** `c.to(M)` and `M.from(c)`, class arguments only. `M.from` is typed through a `this` parameter.
- **`c.to(SameModel)` returns a new instance**, never `this`.
- **Per-call options typed per target model:** `c.to(Lab, { white: 'D65', adaptation: 'cat16' })`, `c.to(Cam16, { La: 20, surround: 'dim' })`. A model without options rejects an options argument at compile time. Verified with `tsc --strict`.
- **The router never routes through a byte model** (`Srgb8`), only to or from one.
- **Listing:** `reachable(Hsl, models)` and `path(Hsl, Lab, models)` take the model set explicitly, from `@lilbunnyrabbit/chromatics/all`.

## Alternatives Considered

1. Parent tree (colorjs.io): one parent per model, path through the nearest common ancestor. Simplest, but a single parent can't express direct sibling formulas.
2. Tree + declared shortcuts: close to this decision; the owner wanted one registry for all edges.
3. Global `registerEdge()` at import: what broke tree-shaking and the prod build.
4. An explicit registry instance passed around: most ceremony.

## Consequences

- `sideEffects: false` is possible; importing `Hsl` alone never pulls in `Hsv`.
- A listing UI must import `/all`.
- Path choice depends on which classes a call touches; tests must pin the expected path for the core pairs.
