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
- **Scaffold notes (2026-10-19):** TypeScript 5.9.3 to match the studio (one TS in the workspace; `svelte-check` needs the TS 5 API). Scripts are Bun-only and typed with `@types/bun` (owner chose it over `@types/node`); the build config sets `types: []` so `src/` can't touch runtime APIs. Bun's workspace install uses the isolated linker, which exposed the studio's undeclared `@codemirror/view` / `state` / `commands` and `@types/estree` imports; they're now declared (owner). The studio's `bunfig.toml` scopes `bun test` to `tests/`, so the package's Vitest suites only run through Vitest.
- **Core models (2026-10-19):**
  - Dev dependencies `culori` 4.0.2 and `@types/culori` (owner, grill 21) feed the cross-check grid only.
  - The package has its own `.prettierrc`: the owner's config.
  - `src/testing/` holds the shared harness and is excluded from the build, like `*.test.ts` and `*.fixtures.json`.
- **File layout (2026-10-19):** a folder per model, flat (`src/models/oklch/{oklch.ts, oklch.test.ts, oklch.domain.ts, oklch.fixtures.json, README.md}`); `src/core/` for the base class, edges, router, family bases; `src/index.ts` root barrel; `src/all.ts`; `scripts/fixtures/` for oracle generators. Tests beside their source.

- **Monorepo (2026-10-20, grill 76):** the app lives in `apps/studio` (not `apps/web`), private, with its Svelte library build removed. The root `package.json` is private and orchestrates through Turborepo (`turbo` dev dependency, owner); `docs/` stays at the root. CI is `ci.yml` running `turbo run check test build --affected` on push and pull request; `deploy.yml` builds only the studio. The owner's `.prettierrc` moved from the package to the root and covers the package and repo files; the studio keeps its own config and formats itself (its plugins resolve only from its `node_modules` under Bun's isolated linker). The package's `test` script now runs both engines. `turbo` 2.11.7 sets `agentGuidance: false`.

- **Release (2026-10-20, grill 77):** `@changesets/cli` 3.0.3 at the root, run on Bun (`bun run changeset`); default changelog generator; `.changeset/config.json` with `access: public`, `baseBranch: master`. `release.yml` on push to `master` runs `changesets/action` 2.1.2: it opens a "Version Packages" PR, and merging it publishes. No CI check requires a changeset. Bun can't publish with OIDC or provenance yet (oven-sh/bun#22423, #15601), so the publish step alone is `npm publish` via `changeset publish`, on the runner's preinstalled npm upgraded to 12.2.0; there is no setup-node in the release. Node stays in `ci.yml` only as the V8 test target (ADR-008).
- **First publish (grill 77):** npm only lets a trusted publisher be added to a package that exists, so the first version goes out by hand, after step 6 (the studio on the package). Until then the package is `"private": true`, which keeps changesets and `npm publish` off it. Runbook:
  1. Drop `"private": true` from `packages/chromatics/package.json`, `bun run changeset` → minor (0.0.0 → 0.1.0), merge, merge the Version Packages PR. Its publish step fails (no trusted publisher yet): expected.
  2. Locally on `master`: `npm login`, `bun run build` in `packages/chromatics`, `npm publish --access public`.
  3. Within 2 days on npmjs.com → the package → Settings → Trusted publisher: GitHub, `lilBunnyRabbit/chromatics`, workflow `release.yml`. Then set publishing access to disallow tokens.
  4. From then on every release is the Version PR; `changeset publish` skips versions already on the registry.
- **First publish done (2026-10-25):** `@lilbunnyrabbit/chromatics@0.1.0` is on npm (`latest`), with a trusted publisher for `lilBunnyRabbit/chromatics` `release.yml` (npm publish allowed, dist-tag not) and publishing access set to require 2FA and disallow bypass tokens. What the runbook didn't cover:
  - The repo setting "Allow GitHub Actions to create and approve pull requests" must be on, or `changesets/action` pushes `changeset-release/master` and then fails to open the Version PR. Turned on (default workflow permissions stay read-only).
  - npm 11.6 won't run its 2FA step without a TTY (`EOTP`, no prompt, no browser link), so the manual publish has to run in a real terminal.
  - npm's staged publishing put a `0.0.0-stage` placeholder on the registry first; 0.1.0 went live after approval on npmjs.com. The trusted publisher has "Allow npm publish" ticked so CI publishes directly instead of staging.
  - The Version PR opened by Actions gets no CI run (GitHub doesn't run workflows on `GITHUB_TOKEN` PRs); its contents are the changeset PR's.

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
