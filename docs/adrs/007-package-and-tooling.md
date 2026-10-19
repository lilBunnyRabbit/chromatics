# ADR-007: Package, layout, tooling, release

**Date:** 2026-10-18
**Status:** Accepted

## Context

The owner's order: build the package on a branch, then turn this repo into a monorepo hosting the package and the website. npm: unscoped `chromatics` is taken (someone else's v1.0.2, 2022); `@lilbunnyrabbit/chromatics` is free. The 2024 attempt was CommonJS with a disabled release workflow; `@lilbunnyrabbit/optional`'s release failed on 2026-10-18 for lack of a trusted publisher. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 9, 10, 13.

## Decision

- **Name:** `@lilbunnyrabbit/chromatics`.
- **ESM only**, `"sideEffects": false` (possible because nothing registers on import, ADR-002).
- **Exports:** a root barrel with every class, `/all` (models array, `parse`, `reachable`, `path`), and a subpath per model (`/oklch`, `/lab`, …). The exports map is generated from the model list.
- **Build:** `tsc` emitting one `.js` + `.d.ts` per source file. No bundler, no CDN build.
- **Location:** `packages/chromatics/` with Bun workspaces now. The studio stays at the root and consumes `workspace:*`; the monorepo step later moves only the app to `apps/web`.
- **Release:** changesets + npm trusted publishing (OIDC), configured before the first publish. No long-lived `NPM_TOKEN`.
- **Versioning:** `0.x` until the API is frozen, then `1.0.0`.
- **Runtime dependencies:** only `@lilbunnyrabbit/optional`. Dev: TypeScript, Vitest, fast-check.

## Alternatives Considered

1. `@chromatics/core` (needs an npm org) or another unscoped name.
2. Dual ESM + CJS: wider reach, two class copies can load.
3. Root barrel + `/all` without per-model subpaths: enough for tree-shaking; the owner wanted subpaths too.
4. A bundler (tsdown) or a separate CDN bundle.
5. Full monorepo now, or a standalone folder without workspaces.
6. Manual `npm publish`; `1.0.0` at first publish.

## Consequences

- CommonJS consumers need Node ≥ 22 `require(esm)`.
- `dist` holds hundreds of small files.
- Workspaces change install and lockfile behaviour for the studio from now on.
