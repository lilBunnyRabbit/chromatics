# CLAUDE.md

Guidance for working in this repo. **Keep it current** — see _Maintaining this file_ at the bottom.

## Read first

1. [docs/PRINCIPLES.md](docs/PRINCIPLES.md): why the project exists, how decisions get made, how the owner works. **Mandatory.**
2. [docs/CONVENTIONS.md](docs/CONVENTIONS.md): where code goes, naming, tests, known drift.
3. [docs/ROADMAP.md](docs/ROADMAP.md): what's done and what's next.
4. [docs/adrs/README.md](docs/adrs/README.md): the ADR index, accepted vs implemented.
5. The latest log in [docs/brainstorm/](docs/brainstorm/) for the area you touch.

**Current focus:** our own npm color package; the studio now runs on it (roadmap step 6, ADR-016). Built on a branch first, then this repo becomes a monorepo hosting the package and the website. The API is being decided with the owner, question by question. Until an ADR says otherwise, nothing about the package's shape is decided.

## Hard rules

- `camelCase` identifiers, `PascalCase` types / classes / Svelte components, `kebab-case` `.ts` files. **No snake_case.** Settled; don't relitigate.
- No `any`. `interface` for object shapes. `private` / `readonly`, never `#private`.
- Runes only in Svelte code.
- No new dependency (runtime or dev) without asking.
- Every color model and system is in scope, except proprietary data (Pantone). Unclear licensing is the owner's call per system.
- Every model ships with its full test matrix (below). A model without it isn't done.

## Numbers need sources

The earlier hand-written libraries died partly on unverified math (`// TODO: AI generated, needs check`). So:

- Every formula cites its source in a comment: spec + section (CSS Color 4 §…, ITU-R BT.2100 Table …), CIE publication, or paper + equation.
- Every expected value in a test comes from an **independent** source, cited next to it: the spec's own examples, colour-science, colorjs.io, a published table. Never computed by the code under test, never from an agent's recall. If no source exists, say so and ask; don't invent one.
- Tolerances are decisions (ADR), not per-test guesses.

**Per-model test matrix** (until a testing ADR refines it):

- Channel boundaries: every min / max, every corner of the model's domain, and just outside it.
- Degenerate input: achromatic (powerless hue), zero, negative, `NaN`, `Infinity`, missing alpha.
- Conversion to and from every direct neighbour, both directions; round-trip within the ADR tolerance.
- Reference vectors from a cited independent source.
- Parse ↔ format round-trip for every string form the model supports.
- The studio switch is gated by the culori baseline (`apps/studio/tests/fixtures/baseline/`, `review.md`) and the Brand Dark golden hexes (`tests/acceptance/brand-dark.test.ts`), which must not regress.

Break the code once on purpose and check the test fails.

## Architecture is the owner's call, always

**Never make an architectural decision yourself.** The most important rule in this repo. The API is the part the owner cares about most: _"I want to be 200% involved and to my liking."_

### What counts as architectural

Anything that changes the shape of the package or the app and isn't already in an ADR or CONVENTIONS:

- the public API: export names, class vs function, method names and signatures, argument order, option objects, return types
- how a color is represented and stored; precision
- conversion routing (hubs, graph), how models plug in, tree-shaking and export layout
- package-wide numeric policy: out-of-gamut, clamping, powerless hue, `none`, equality
- error behaviour: throw, return `undefined`, or flag
- a new dependency, or the monorepo / build / publish tooling
- a new state layer, abstraction, registry, or plugin mechanism in the app
- deviating from an ADR or from the pattern the repo already uses
- anything justified by "we'll need it later"

### What doesn't count

Just do these:

- implementing what an ADR already specifies
- adding a model inside an existing, ADR-backed pattern (still with its full test matrix)
- **model specifics** (owner, 2026-10-19: "how to define models is your choice based on what is best and normally the practice"): which constants, white point, transfer variant, channel letters and ranges, per-model thresholds and tolerances, which reference vectors. Follow the primary source and common practice, record the choice and its reasoning in the brainstorm log and ADR, and report it. A new class name, or a choice that bends a package-wide rule (ADR-003 / ADR-004), is still asked
- bug fixes that don't change shape
- renames the owner asked for, formatting, docs, tooling

When in doubt, treat it as architectural.

### How to ask: grill the owner

1. **Stop before the first edit.** Investigate, then stop. Never ship a "temporary" version of an API to ask about later.
2. **Brief first.** What the area is for, what exists today, what needs deciding. The owner must never guess what a question is about.
3. **State the problem and its root cause** in one or two sentences, with evidence (`file:line`, branch, spec section).
4. **Lay out the real options**, lightest first, each with a code sketch of how it **reads at the call site** and what breaks with it.
5. **Recommend one, then attack it yourself.** The strongest argument against your own pick.
6. **Grill.** The hard questions the owner may not have considered:
   - How does this read for a library user who never saw the DSL?
   - What does it do to bundle size and tree-shaking?
   - What happens with an out-of-gamut, achromatic, or `NaN` input?
   - Which conversion paths does it touch, and how is precision kept?
   - Is it a breaking change once published?
   - Which earlier iteration tried this, and why did it die?
   - What's the smallest version that still answers the question?
     Challenge the request itself if it looks wrong.
7. **Record it.** Log the discussion in `docs/brainstorm/` during the session. If final, write an ADR. Only then implement.

Claude Code: use `AskUserQuestion`, recommended option first, a code preview per option. Never ask in prose and then carry on.

Subagents that implement get this section in their prompt; otherwise scope them to investigation only. Brainstorm subagents may run on Fable (owner, 2026-10-18); their output is input to the grill, never a decision.

If work is blocked on the owner, finish everything that doesn't depend on the answer, then stop and report.

## Documentation duties

- **Brainstorm logs:** `docs/brainstorm/YYYY-MM-DD-topic.md` for every design discussion, updated **during** the session. Sections: date and participants, context, topics with decisions, key takeaways, action items, next session topics.
- **ADRs:** `docs/adrs/NNN-title.md` once a decision is final, added to the index. Implementation that forces a change adds a dated revision note.
- **Roadmap:** at the end of every session that completes work, update `docs/ROADMAP.md` and the ADR status.
- **Package API docs:** every exported symbol has JSDoc with units, ranges and the formula's source.
- The vault (`docs/chromatics/`) is research and history. Don't rewrite it; new decisions go to ADRs.

## What this is

**Chromatics** — a scriptable **color language** (a small JS-subset DSL) plus an **interactive studio** for designing, analyzing and exploring color. Write a tiny program that derives a whole palette from one brand color; inspect any color across ~100 color models; check accessibility; preview it on real UI — all in the browser. Colours are instances of the `@lilbunnyrabbit/chromatics` package's classes, in the model they were built in.

Repo layout: the studio app lives in `apps/studio/`; app paths in this file (`src/…`, `static/…`, `tests/…`, `package.json`) are relative to it. The color package lives in `packages/chromatics/`; the studio runs on it since roadmap step 6 (ADR-016).

## Repo, branch & deployment

- **This is the canonical repo: `lilBunnyRabbit/chromatics`.** The app was first committed on the **`the-final-decision`** branch (the same branch that holds the research vault `docs/chromatics/`), and is **merged into `master`** from there. `master` is the deploy branch; `the-final-decision` is where the port + vault live together.
- **Provenance.** The app was developed in the separate `lilBunnyRabbit/color-testing` repo (the DSL half on `test-dsl`, the display half on `master`, then merged) and **ported here**. `color-testing` is the old/abandoned location — do not push there; work happens here.
- **Deployment.** `.github/workflows/deploy.yml` builds on push to **`master`** and publishes to **GitHub Pages** at `https://lilbunnyrabbit.github.io/chromatics/`. `BASE_PATH` is derived from the repo name (`/${{ github.event.repository.name }}` → `/chromatics`), so the base path follows the repo automatically — don't hardcode it. (The `github-pages` environment only allows `master`/`dev` to deploy.)
- **Prerender / SEO.** All routes are prerendered (`export const prerender = true` in `src/routes/+layout.ts`) so each ships as a real **200** HTML file with the shared `<head>` — without this, `adapter-static`'s `fallback: '404.html'` makes GitHub Pages serve **HTTP 404** for _every_ URL (crawlers read that as "don't index"). The home `/` keeps **SSR on** (no `ssr=false`): its mount-gated shell renders `DesktopShell` at build time, so the prerendered `index.html` carries a real `<title>`, an indexable `.sr-only` `<h1>`+blurb (`+page.svelte`), `<main>`/`<nav>` landmarks (`DesktopShell.svelte`), and a self-referential canonical. `/mixer` + `/models` keep `ssr=false` (browser-only canvas/matchMedia/live-color code) so they prerender to a shell with only the shared static `<head>` — a generic `<title>` fallback from `app.html`; their per-route `<svelte:head>` titles upgrade client-side. Rounded out by `static/sitemap.xml` + `WebApplication`/`WebSite` JSON-LD. **Subpath caveat:** a `robots.txt`/`sitemap.xml` under `/chromatics/` is _not_ auto-discovered (robots is only honored at the host root, which this repo doesn't own) — submit the sitemap via Search Console. Don't flip `/mixer`·`/models` to `ssr=true` without re-verifying the build (their browser-only code would server-render). `/showcase` prerenders too but is **`noindex, follow`** and is deliberately **absent from the sitemap** — it renders other sites' embedded content, and the canonical page is the studio; its shell is mount-gated because the scheme lives in the (browser-only) hash.
- **Branding / meta / assets** (keep in sync if branding changes):
  - `static/favicon.svg` — the brand mark: a rounded-square **conic color wheel** matching the in-app `.brand-dot` (`conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d)` in `DesktopShell.svelte` / mobile `MobileShell.svelte`).
  - `static/og.png` (1200×630, dark `#0f1115` theme) + its source `static/og.svg` — the social card referenced by the Open Graph / Twitter tags.
  - `src/app.html` — global `<head>`: a default `<title>` (`Chromatics — color as code`), description, OG/Twitter tags, `theme-color`, icons, a GA preconnect, and `WebApplication`/`WebSite` JSON-LD. `/mixer` + `/models` override the title client-side via `<svelte:head>`; the home `<h1>` + canonical live in `src/routes/+page.svelte`.
  - Absolute URLs hardcode `https://lilbunnyrabbit.github.io/chromatics/` in **four** places (static files / `app.html` can't read `BASE_PATH`) — the OG/Twitter tags **and** the JSON-LD in `src/app.html`, the `<loc>`s in `static/sitemap.xml`, and the canonical in `src/routes/+page.svelte`. Update **all** of them together if the deploy URL changes.

## Stack

SvelteKit 2 + **Svelte 5 runes** + TypeScript + **Bun** workspaces + **Turborepo** + CodeMirror 6 + `@lilbunnyrabbit/chromatics` + Tailwind v4 + `adapter-static` (static SPA, deployed to GitHub Pages on push to `master`).

## Commands / gates

A Bun + Turborepo monorepo (ADR-007, grill 76): the studio in `apps/studio` (private), the package in `packages/chromatics`, `docs/` at the root. Root scripts run through `turbo` from the **repo root** (the Bash shell cwd can drift into subdirs; `cd` first):

```sh
bun install
bun run dev            # studio dev server
bun run test           # studio bun:test (466 across 28 files) + package Vitest on node and bun (8,699)
bun run check          # studio svelte-check (expect 0 errors / 0 warnings) + package tsc
bun run build          # studio static build → apps/studio/build/, package → packages/chromatics/dist/
bun run lint           # prettier --check: root config for the package and repo files, the studio its own
bun run format         # prettier --write, same split
bun run changeset      # add a changeset for the package (changesets on Bun)
```

One workspace: `bunx turbo run test --filter=studio` (or `--filter=@lilbunnyrabbit/chromatics`). Before calling any change done: **`bun run check` + `bun run test` + `bun run build` + `bun run lint` all green.** CI (`.github/workflows/ci.yml`) runs `lint` and `turbo run check test build --affected` on every push and pull request; `deploy.yml` builds only the studio. `release.yml` (changesets, on `master`) opens the Version Packages PR and publishes on its merge; the package is on npm (0.1.0 published 2026-10-25) and releases only go through that PR, via npm trusted publishing (ADR-007). Add a changeset (`bun run changeset`) to anything that should ship. Note: Bun resolves `./x.js` imports to `x.ts`. The studio's `bun test` is scoped to its `tests/` (`apps/studio/bunfig.toml`).

Studio generators (run from `apps/studio`): `bun run baseline` regenerates `tests/fixtures/baseline/package/` and `review.md` against the frozen `culori/` dump (ADR-016 gate; `tests/baseline.test.ts` fails when stale; read the review diff before committing). `bun run package-docs` regenerates `src/lib/dsl/package-docs.json` from the package's JSDoc (a test fails when stale).

Package generators (run from `packages/chromatics`):

```sh
bun run matrices       # regenerate src/core/matrices.ts from exact rational arithmetic
bun run fixtures:culori # regenerate the culori cross-check grid in each <model>.fixtures.json
bun run exports        # regenerate package.json exports: one subpath per model folder (a test checks it)
```

Formatting: the root `.prettierrc` is the owner's (2 spaces, double quotes, 120 cols) and covers the package; `apps/studio/.prettierrc` (tabs, Svelte + Tailwind plugins) covers the studio, which formats itself because its plugins live in its own `node_modules`.

## Architecture is the owner's call, always

**Never make an architectural decision yourself.** The most important rule in this repo. The API is the part the owner cares about most: _"I want to be 200% involved and to my liking."_

### What counts as architectural

Anything that changes the shape of the package or the app and isn't already in an ADR or CONVENTIONS:

- the public API: export names, class vs function, method names and signatures, argument order, option objects, return types
- how a color is represented and stored; precision
- conversion routing (hubs, graph), how models plug in, tree-shaking and export layout
- package-wide numeric policy: out-of-gamut, clamping, powerless hue, `none`, equality
- error behaviour: throw, return `undefined`, or flag
- a new dependency, or the monorepo / build / publish tooling
- a new state layer, abstraction, registry, or plugin mechanism in the app
- deviating from an ADR or from the pattern the repo already uses
- anything justified by "we'll need it later"

### What doesn't count

Just do these:

- implementing what an ADR already specifies
- adding a model inside an existing, ADR-backed pattern (still with its full test matrix)
- **model specifics** (owner, 2026-10-19: "how to define models is your choice based on what is best and normally the practice"): which constants, white point, transfer variant, channel letters and ranges, per-model thresholds and tolerances, which reference vectors. Follow the primary source and common practice, record the choice and its reasoning in the brainstorm log and ADR, and report it. A new class name, or a choice that bends a package-wide rule (ADR-003 / ADR-004), is still asked
- bug fixes that don't change shape
- renames the owner asked for, formatting, docs, tooling

When in doubt, treat it as architectural.

### How to ask: grill the owner

1. **Stop before the first edit.** Investigate, then stop. Never ship a "temporary" version of an API to ask about later.
2. **Brief first.** What the area is for, what exists today, what needs deciding. The owner must never guess what a question is about.
3. **State the problem and its root cause** in one or two sentences, with evidence (`file:line`, branch, spec section).
4. **Lay out the real options**, lightest first, each with a code sketch of how it **reads at the call site** and what breaks with it.
5. **Recommend one, then attack it yourself.** The strongest argument against your own pick.
6. **Grill.** The hard questions the owner may not have considered:
   - How does this read for a library user who never saw the DSL?
   - What does it do to bundle size and tree-shaking?
   - What happens with an out-of-gamut, achromatic, or `NaN` input?
   - Which conversion paths does it touch, and how is precision kept?
   - Is it a breaking change once published?
   - Which earlier iteration tried this, and why did it die?
   - What's the smallest version that still answers the question?
     Challenge the request itself if it looks wrong.
7. **Record it.** Log the discussion in `docs/brainstorm/` during the session. If final, write an ADR. Only then implement.

Claude Code: use `AskUserQuestion`, recommended option first, a code preview per option. Never ask in prose and then carry on.

Subagents that implement get this section in their prompt; otherwise scope them to investigation only. Brainstorm subagents may run on Fable (owner, 2026-10-18); their output is input to the grill, never a decision.

If work is blocked on the owner, finish everything that doesn't depend on the answer, then stop and report.

## Documentation duties

- **Brainstorm logs:** `docs/brainstorm/YYYY-MM-DD-topic.md` for every design discussion, updated **during** the session. Sections: date and participants, context, topics with decisions, key takeaways, action items, next session topics.
- **ADRs:** `docs/adrs/NNN-title.md` once a decision is final, added to the index. Implementation that forces a change adds a dated revision note.
- **Roadmap:** at the end of every session that completes work, update `docs/ROADMAP.md` and the ADR status.
- **Package API docs:** every exported symbol has JSDoc with units, ranges and the formula's source.
- The vault (`docs/chromatics/`) is research and history. Don't rewrite it; new decisions go to ADRs.

## What this is

**Chromatics** — a scriptable **color language** (a small JS-subset DSL) plus an **interactive studio** for designing, analyzing and exploring color. Write a tiny program that derives a whole palette from one brand color; inspect any color across ~100 color models; check accessibility; preview it on real UI — all in the browser. Colours are instances of the `@lilbunnyrabbit/chromatics` package's classes, in the model they were built in.

Repo layout: the studio app lives in `apps/studio/`; app paths in this file (`src/…`, `static/…`, `tests/…`, `package.json`) are relative to it. The color package lives in `packages/chromatics/`; the studio runs on it since roadmap step 6 (ADR-016).

## Repo, branch & deployment

- **This is the canonical repo: `lilBunnyRabbit/chromatics`.** The app was first committed on the **`the-final-decision`** branch (the same branch that holds the research vault `docs/chromatics/`), and is **merged into `master`** from there. `master` is the deploy branch; `the-final-decision` is where the port + vault live together.
- **Provenance.** The app was developed in the separate `lilBunnyRabbit/color-testing` repo (the DSL half on `test-dsl`, the display half on `master`, then merged) and **ported here**. `color-testing` is the old/abandoned location — do not push there; work happens here.
- **Deployment.** `.github/workflows/deploy.yml` builds on push to **`master`** and publishes to **GitHub Pages** at `https://lilbunnyrabbit.github.io/chromatics/`. `BASE_PATH` is derived from the repo name (`/${{ github.event.repository.name }}` → `/chromatics`), so the base path follows the repo automatically — don't hardcode it. (The `github-pages` environment only allows `master`/`dev` to deploy.)
- **Prerender / SEO.** All routes are prerendered (`export const prerender = true` in `src/routes/+layout.ts`) so each ships as a real **200** HTML file with the shared `<head>` — without this, `adapter-static`'s `fallback: '404.html'` makes GitHub Pages serve **HTTP 404** for _every_ URL (crawlers read that as "don't index"). The home `/` keeps **SSR on** (no `ssr=false`): its mount-gated shell renders `DesktopShell` at build time, so the prerendered `index.html` carries a real `<title>`, an indexable `.sr-only` `<h1>`+blurb (`+page.svelte`), `<main>`/`<nav>` landmarks (`DesktopShell.svelte`), and a self-referential canonical. `/mixer` + `/models` keep `ssr=false` (browser-only canvas/matchMedia/live-color code) so they prerender to a shell with only the shared static `<head>` — a generic `<title>` fallback from `app.html`; their per-route `<svelte:head>` titles upgrade client-side. Rounded out by `static/sitemap.xml` + `WebApplication`/`WebSite` JSON-LD. **Subpath caveat:** a `robots.txt`/`sitemap.xml` under `/chromatics/` is _not_ auto-discovered (robots is only honored at the host root, which this repo doesn't own) — submit the sitemap via Search Console. Don't flip `/mixer`·`/models` to `ssr=true` without re-verifying the build (their browser-only code would server-render). `/showcase` prerenders too but is **`noindex, follow`** and is deliberately **absent from the sitemap** — it renders other sites' embedded content, and the canonical page is the studio; its shell is mount-gated because the scheme lives in the (browser-only) hash.
- **Branding / meta / assets** (keep in sync if branding changes):
  - `static/favicon.svg` — the brand mark: a rounded-square **conic color wheel** matching the in-app `.brand-dot` (`conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d)` in `DesktopShell.svelte` / mobile `MobileShell.svelte`).
  - `static/og.png` (1200×630, dark `#0f1115` theme) + its source `static/og.svg` — the social card referenced by the Open Graph / Twitter tags.
  - `src/app.html` — global `<head>`: a default `<title>` (`Chromatics — color as code`), description, OG/Twitter tags, `theme-color`, icons, a GA preconnect, and `WebApplication`/`WebSite` JSON-LD. `/mixer` + `/models` override the title client-side via `<svelte:head>`; the home `<h1>` + canonical live in `src/routes/+page.svelte`.
  - Absolute URLs hardcode `https://lilbunnyrabbit.github.io/chromatics/` in **four** places (static files / `app.html` can't read `BASE_PATH`) — the OG/Twitter tags **and** the JSON-LD in `src/app.html`, the `<loc>`s in `static/sitemap.xml`, and the canonical in `src/routes/+page.svelte`. Update **all** of them together if the deploy URL changes.

## Stack

SvelteKit 2 + **Svelte 5 runes** + TypeScript + **Bun** workspaces + **Turborepo** + CodeMirror 6 + `@lilbunnyrabbit/chromatics` + Tailwind v4 + `adapter-static` (static SPA, deployed to GitHub Pages on push to `master`).

## Commands / gates

Run from the **repo root** (the Bash shell cwd can drift into subdirs — `cd` first):

```sh
bun install
bun run dev            # dev server
bun test               # unit tests (bun:test) — currently 466 across 28 files
bun run check          # svelte-kit sync + svelte-check (expect 0 errors / 0 warnings)
bunx vite build        # static build → build/  (also: bun run build)
bun run format         # prettier --write
```

Before calling any change done: **`bun test` + `bun run check` + `bunx vite build` all green.** Note: Bun resolves `./x.js` imports to `x.ts`. Root `bun test` is scoped to `tests/` (`bunfig.toml`).

Package (`packages/chromatics`, run from that folder):

```sh
bun run test:all       # Vitest on node (V8) and bun (JSC) — both must pass (ADR-008)
bun run check          # tsc --noEmit
bun run build          # tsc → dist/ (ESM, per file)
bun run matrices       # regenerate src/core/matrices.ts from exact rational arithmetic
bun run fixtures:culori # regenerate the culori cross-check grid in each <model>.fixtures.json
bun run exports        # regenerate package.json exports: one subpath per model folder (a test checks it)
```

Formatting: `bunx prettier --write packages/chromatics` from the root; the package has its own `.prettierrc` (the owner's: 2 spaces, double quotes, 120 cols).

## Architecture

### Color — `@lilbunnyrabbit/chromatics` + `src/lib/color/` (ADR-016)

Colours are **package instances** (`packages/chromatics`, workspace dependency): mutable classes, methods mutate and return `this`, `to(Model)` always returns a new instance. There is no studio wrapper: app code writes the package chain at the call site (display hex = `c.to(Srgb).gamutMap().to(Srgb8).toHex()`, gamut test = `c.to(Srgb).inGamut()`, CSS = `c.to(Oklch).toCss()`). Colours leaving a DSL program are `Object.freeze`d, so app code that forgets `clone()` throws instead of corrupting shared state.

- `catalog.ts` — `CATALOG` / `infoOf` / `infoByName`: the package's 70 models with studio labels and families (mixer, pickers, `/models`, docs).
- `spaces.ts` — **the "pick a model" source of truth**: `INTERP_SPACES` + `mixIn` (gradient/mix), `HUE_MODELS` + `rotateIn` / `harmonyColors` (harmony), `RAMP_MODELS` + `rampColors` (tonal ramps). Entries hold the model **class**; pickers use its export name.
- `contrast-guard.ts` — `ensureContrast` / `wcagTargetRatio`, the engine of the `ensureContrast` builtin and the Auto-fix tool.
- `legacy.ts` — ADR-017: the **one place** the old DSL's names live (old model ids → package names, old constructors, flat keys, unit changes, the `/models` reference table for models with no package class). Nothing here is accepted by the evaluator.

### DSL — `src/lib/dsl/`

- `values.ts` — `DSLValue`, coercions (`num`/`str`/`color`/`model`), `MODEL_CLASSES` (package classes by **export name**, never `class.name`: a minified build renames classes), `freezeColors`.
- `evaluator.ts` — acorn parse → controlled AST walk (no raw `eval`); per-statement try/catch; returns `EvalResult`. **The DSL is the package API** (ADR-016): model classes are callable with or without `new`, members are the instance's own (package internals hidden by name: `_*`, `assign`, `write`, `alphaOf`), channel assignment (`c.l = 0.5`, `+=`…), JS mutation semantics inside a program, colours frozen on return. Also desugars **block scoping** — `tokens { … }` / `component { … }` / `preview { … }` / `roles { … }` (a length-preserving rewrite to a labeled statement, so offsets/line numbers are untouched). The first three are **builder** blocks: the namespace's members are called **bare** (`ramp(c)` ≡ `preview.ramp(c)`) and each line becomes a top-level variable. `roles { role = color }` is a **mapping** block: the RHS is captured as a color _name_ (not evaluated) and the block aggregates into one `roles` theme-config variable. The dotted forms (`preview.x`, `tokens.x`, `theme({…})`) work too.
- `environment.ts` — the package classes, `parse`, `ensureContrast`, the design-system namespaces and math. No colour free functions (ADR-016 78k): `a.to(Oklab).mix(b.to(Oklab))`, `fg.to(Srgb).contrast(bg.to(Srgb))`, `a.to(Lab65).deltaE2000(b.to(Lab65))`. **`ensureContrast(fg, bg, target?)`** (engine: `color/contrast-guard.ts`) is the **contrast-guard combinator** — it returns the nearest color to `fg` (OKLCH lightness, then chroma) whose gamut-mapped form meets the WCAG `target` (`"AA"`/`"AAA"`/`"AA-large"`/`"AAA-large"`/raw ratio, default `"AA"`) against `bg`, preserving hue and best-effort-ing to black/white when unreachable. Because the DSL re-evaluates on every edit, defining `fg = ensureContrast(seed, bg, "AAA")` keeps the pair legible as the seed changes — the reactive answer to the CD-13 "maintained accessibility" question (no role-graph solver, no source rewrite). The Studio **Auto-fix** tool (`components/tools/AutoFix.svelte`) previews with the same solver and emits this live call.
- `manifest.ts` — **the single source of truth** for highlighter, autocomplete, hover and the Docs overlay, built from the package classes plus `package-docs.json` (the package's JSDoc and signatures, extracted by `scripts/package-docs.ts`; regenerate with `bun run package-docs` after a package API change). Autocomplete and hover use the receiver variable's model from the last evaluation.
- `migrate.ts` — ADR-017: old-DSL → package-DSL codemod (AST, old model inference so results are kept; `clone()`/`to()` before mutating calls; leftovers flagged `// migrate:`). A no-op on new code. UI: `components/UpgradeBanner.svelte` (banner when the source is old, "Upgrade script" in the editor header, review diff, Apply).
- `lang.ts` / `complete.ts` / `hover.ts` / `swatch-deco.ts` / `block-scope.ts` / `editor-bindings.ts` — CodeMirror language, autocomplete, hover docs, inline color markers, the **block-aware editor** seam, and the bindings the editor consumes. `block-scope.ts` (manifest-driven, no drift) tells both the highlighter and autocomplete which `label { … }` block wraps the cursor: inside a builder block the bare members highlight as methods + complete first; inside `roles {}` role keys complete on the left, named colors on the right.
- `preview.ts` — `preview.*` primitives that render as cards. Three relationship previews are **model-parameterized** (idiomatic per-primitive arg): `gradient(from, to, space?|{space,hue,stops})` (any `INTERP_SPACES` space + hue strategy `shorter/longer/increasing/decreasing`), `ramp(base, Model?)` (any `RAMP_MODELS` lightness axis), `harmony(base, scheme?, Model?)` (any `HUE_MODELS` wheel); model args are classes (`preview.ramp(c, Lab)`). The ramp/gradient cards flag **out-of-sRGB** stops (dashed marker) and the ramp shows **ΔE2000 spacing** between shades (perceptual evenness). The Studio **Harmony / Ramp / Gradient** tools (`components/tools/`) each carry the matching model/space picker and generate model-aware DSL. `components.ts` / `tokens.ts` / `theme.ts` — the `component.*` / `tokens.*` / `theme()` namespaces for the styleguide. **`tokens.*`** is the design-token namespace (`text`/`space`/`radius`/`shadow` + `tokens.token()` for arbitrary groups). `tokens`/`component`/`preview` each work as a dotted namespace **or** a builder `name { … }` block; `roles { role = color }` is a mapping block (alias of `theme({…})`).
- `model-docs.ts`, `channel-docs.ts`, `encyclopedia.ts` — vault-distilled copy for docs & `/models`.

### Other libs

- `analysis/` — `contrast`/`wcag`/`apca` (WCAG 2 + APCA), `cvd` (color-vision sim), `similarity` (ΔE), `print` (CMYK proof), `quantize` (image→palette), `combinations` (candidate bg/fg/primary search). **`combinations.ts`** is the engine behind the Studio's **Compare** tool (`components/tools/Compare.svelte`): `combinationCtx(entries)` precomputes the O(n²) contrast/APCA/ΔE matrices plus their dichromacy worst cases, `rankCombinations(ctx, {target,limit})` enumerates every bg × fg × primary (auto-picking the most legible `primaryFg`), filters to the WCAG target and ranks by a documented 0–100 composite, and `scoreCombination(ctx, combo)` measures one. Pure & unit-tested (`tests/combinations.test.ts`); the component renders each candidate on one identical mini-UI and applies the winner through the role-override seam (or writes a `theme()` block).
- `scheme/` — `adapter` (`EvalResult`→`Scheme`), `roles` (role mapping + audit; `resolveRoles` collapses a sparse map onto the heuristic, `applyOverrides` layers a per-mode override on an already-resolved set), `tokens`, `components`, `theme-config` (mode-aware: `themeRolesFromScheme(scheme, mode)`). `derive.ts` is the **shared spine** (CD-12): `deriveScheme(source, {roles, darkRoles, opacities}) → RenderedScheme` bundles the whole `evaluate → scheme → roles/audit/tokens/components` cascade (plus the `dark*` siblings) as one pure function; `app.svelte.ts` calls it once and re-exposes each field as a thin `$derived`. **Role precedence is override → `theme()`/`roles {}` → name heuristic**: an explicit UI pick always wins, so authored roles are a default, never a lock; `autoRoles`/`darkAutoRoles` expose what "auto" would have picked so the UI can show it. `flow.ts` is the **Design System** guided-flow model (pure step completeness + scaffold strings). `modes.ts` does light/dark as pure role re-binding (`darkRolesFor`/`modeWarnings`/`modeFragilePairs`).
- `export/` — CSS / DTCG / Tailwind / Markdown (`index.ts`), swatch SVG/PNG (`swatch.ts`), styleguide (`styleguide.ts`). The Export tab also carries the **Embed** builder (a `/showcase` iframe snippet — see `showcase/config.ts`), which is UI-only and lives in `ExportPanel.svelte`. Colors serialize through one `serializeColor(entry, ColorFormat)` seam: **as-defined** (authoring model when it's valid CSS — see `isCssColor` — else a selectable fallback model) or **single model** (`CSS_COLOR_MODELS`); long floats rounded.
- `mixer/engine.ts` — shared by `/mixer` and `/models`. `render/resolve.ts` — shared ref resolver.
- `showcase/config.ts` — the **embed contract** for `/showcase`: `ShowcaseConfig` + `parseShowcaseConfig(query)` / `showcaseSearch(cfg)` / `buildShowcaseUrl(...)` / `buildEmbedSnippet(url, opts)`. Pure and unit-tested (`tests/showcase.test.ts`), and shared by both ends — the embed page parses what the Export tab's **Embed** builder writes, so the two can't drift. Presentation lives in the query (`views`, `tab`, `theme`, `edit`, `chrome`, `title`, `autoheight`), the scheme itself in the hash.
- `persistence/` — `documents` (the per-doc store: `DocEnvelope`s keyed by a stable id + a rebuildable index; debounced autosave, idempotent migration, library import/export — pure & unit-tested), `url-hash` (shareable links), `local-storage` (first-run welcome flag). Keys: `chromatics:doc:<id>`, `chromatics:index`, `chromatics:active`, `chromatics:schema`, `chromatics:theme`, `chromatics:ui`, `chromatics:welcomed`. Legacy `chromatics:last` / `chromatics:scheme:<name>` are migrated into documents on first load (left in place one release as a safety copy).

### State — `src/lib/state/` (runes singletons)

- `app.svelte.ts` — `app`: `source` → `result` → `scheme`, then all the `$derived` role/token/component/audit state. **No panel mutates the scheme**; everything downstream is derived. Role overrides are per mode — `app.roles` (light) + `app.darkRoles` (dark), `''` = auto — and `app.previewMode` is the shared light/dark view knob; `app.modeOverrides`/`modeAutoRoles`/`modeRoles`/`modeAudit` are the "previewed mode, resolved" accessors every preview surface binds to. **`app.settings()` / `app.applySettings(s)` are the one `DocSettings` seam** — autosave, share links and the `/showcase` embed all snapshot and restore through them, so a new per-doc setting can't be persisted but silently dropped from a link; `applySettings` defaults every hole (a partial or pre-`darkRoles` payload must not put `undefined` where a panel renders a number).
- `docs.svelte.ts` — `docs`: the active document + a recency `index`. Owns the single debounced autosave effect (gated on `docs.hydrated`) that writes `app.source` **plus** the per-doc Preview/Studio/Styleguide settings (`roles`/`darkRoles`/`opacities`/`visionSim`/`fgOpacity`) back to the active doc's own slot, and the new/open/rename/delete/duplicate/import/export lifecycle. `app.source` stays the single editable root; `docs` is the persistence seam around it.
- `ui.svelte.ts` — `ui`: theme, resizable/collapsible editor, active `Tab`, swatch mode, and the `mounted`/`isMobile` viewport gate.
- `welcome.svelte.ts` — `welcome.open` for the first-run showcase modal.

### UI — `src/routes/` + `src/lib/components/`

- `+layout.svelte` — applies/persists theme + ui prefs; flips `ui.isMobile` via `matchMedia` **after mount** (SSR/first render stays desktop → no hydration mismatch); renders the global `<Welcome/>`.
- `+page.svelte` — mount-gated shell chooser: `DesktopShell` vs mobile `MobileShell`.
- `DesktopShell.svelte` — top bar (`DocControls`, Share, Mixer/Models links, **?** welcome, theme) + drag-resizable/collapsible editor (its header carries the **API reference** toggle → `Docs` overlay) + tabbed analysis pane. The Inspector's "watch it cascade" flash diffs through `$lib/util/cascade` (`diffCascade`), which retains its baseline while the scheme is mid-edit-invalid so the flash survives an error blip.
- `DocControls.svelte` — shared document bar/sheet (`variant: 'bar' | 'sheet'`): recency switcher, inline rename, Saved/Saving chip, Save/New, new-from-template, duplicate, delete-with-confirm, library import/export, storage + cross-tab chips. Driven entirely by the `docs` store; used by both shells so save UX never drifts.
- Analysis tabs (shared by both shells via `ui.tab`): progressive disclosure splits them into `PRIMARY_TABS` (**Inspector · Studio · Preview · Design System · Export**) and `ADVANCED_TABS` (**Matrix · Validate**), defined in `ui.svelte.ts`. The **Design System** tab (`Styleguide.svelte`, tab id still `styleguide`) is a guided flow — Roles → Light/Dark → Components → Tokens → Handoff — over the same derived state (`components/system/FlowSteps.svelte` + `scheme/flow.ts`); completeness is purely `$derived`, each unfinished step's **Scaffold** appends real DSL, and light/dark is a non-dirtying preview toggle backed by `theme.dark()` re-binding. **Preview and Design System share one light/dark toggle (`app.previewMode`) and one per-role, per-mode override dropdown**: `Auto` follows the DSL role definitions and _names the color it landed on_ (`Auto · name #hex`), anything else pins that role for that mode and beats the DSL — the toggle works whether or not a dark theme is authored, and nothing rewrites `app.source`. Desktop shows the primary set + a "More" overflow popover for advanced; mobile shows the first four primary in the bottom bar + the rest in the More sheet. Plus `Docs.svelte` (DSL reference overlay). The 3-D **`ModelViewer`** is **not** a tab — it lives on `/models`, pinned to the selected model.
- `components/mobile/` — `MobileShell` + `BottomTabBar` (5 slots) + `MoreSheet` (overflow + app actions) + `MobileEditorSheet` + `Sheet`.
- `components/showcase/ShowcaseShell.svelte` — the `/showcase` embed surface: palette strip + tab strip over the **same** analysis panels the studio uses (`Editor` read-only, `Inspector`, `Preview`, `Styleguide`, `Matrix`, `Validate`, `ExportPanel`), plus an ✎ that forks the scheme in place and an "Open in Chromatics ↗" link. Two invariants keep it safe in someone else's page: it never calls `docs.init()` (so autosave, gated on `docs.hydrated`, never runs) and it sets `ui.sourceLocked` while locked (so the DSL emitters behind `tools/shared.ts#insert` are inert). **Sizing is the subtle part:** the studio's panels assume a fixed-height shell (`height:100%` root + inner `overflow-y:auto`), so the embed gives its body a _definite_ height that it settles onto the active panel's content (measure overflow → grow → repeat, floor on every view switch; the code pane is `data-fixed` and excluded). The settled height is then posted to the host as `postMessage({type:'chromatics:height'})`. Two traps that cost a debugging round: the loop runs on **timers, not `requestAnimationFrame`** (a background tab parks rAF, and ResizeObserver delivery rides the same loop), and the posted height is measured from the shell's **own content box** — `documentElement.scrollHeight` can only ratchet upward once the host has grown the frame. Generated from **Export → Embed**.
- `Welcome.svelte` — first-run **welcome showcase modal** (rendered in `+layout`). Hero "color as code" card + a feature grid; each card jumps to the relevant tab/route and loads a tailored example. Auto-opens once (`hasWelcomed`/`markWelcomed`), re-openable from the **?** button in every header. A11y: `role=dialog`, focus trap, Esc/backdrop close, body-scroll lock.

### Routes

| Route       | What                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`         | The studio — editor + analysis tabs                                                                                                                                  |
| `/models`   | Encyclopedia of all color models & systems (+ 2-D gamut plane & 3-D `ModelViewer` per model)                                                                         |
| `/mixer`    | Cross-model mixer — one color, every model, live sliders                                                                                                             |
| `/showcase` | **Embeddable** read-first view of a shared scheme — palette strip + Code/Inspector/Preview/Design System/Export, for iframing into an external brand-guidelines page |

Examples live in `src/routes/examples/` (Overview, Simple, Conversions, Showcase, Previews, Design System, microSaaS Dashboard, **microSaaS — Enforced**, **Brand Dark**, Dynamic Theme); `examples/index.ts` orders them (first = default on load). **microSaaS — Enforced** is the same dashboard with every foreground derived through `ensureContrast(seed, bg, target)` instead of a hand-tuned-then-checked ternary — body text guaranteed AAA, button labels AA, in both themes, re-solved on every edit (the contrast-guard combinator in action). **microSaaS Dashboard** is the flagship dual-mode example: a full role/token/component design system from one brand color, with a nested `roles { … dark { } }` rebinding so light + dark ride one shared palette/audit (brand triad + semantics shared, only neutrals split into `*` / `*_d`). Components ref role names so they re-theme; named for clean CSS-var / Tailwind export (`bg-primary`, `--surface`, …) and AA-safe in both modes via auto-picked button labels. **Brand Dark** is the dark-only counterpart: one teal seed (`OKLCH(0.255, 0.0233, 230.47)`) + an 18-variant surface ladder (lightness step × chroma mode `sat`/`flat`/`desat`, the two axes coupled by one ratio), semantics, harmony, a 45° hue ring, and a single `ensureContrast`-guarded `ink` bound to all four `*Fg` roles. It reproduces the original hand-written scheme's published hexes byte-for-byte and posts the best audit record of any example. The old Brand Dark/Light _templates_ were removed and the palette-only source survives as `tests/fixtures/brand-dark.ts`, still the parity oracle for the golden-hex + role-mapping tests — `tests/acceptance/brand-dark.test.ts` pins the example to that oracle so the two can't drift.

## The research vault — `docs/chromatics/`

An **Obsidian vault** (markdown, not part of the build — `adapter-static` only prerenders `src/routes/`) that is the project's "second brain": every idea, decision, and plan from the run that produced Chromatics. **Preserve it** — it's the in-depth investigation this project grew out of, and it's the source behind a lot of the in-app copy. Start at `docs/chromatics/Home.md`. Structure: `00-Overview` (Vision, Project History, Status & Inventory, Glossary) · `01-Decisions` (Decision Log, _Build vs Buy_ → wrap culori, Architecture Decisions, Open Questions) · `02-Knowledge` (color science, accessibility, color theory, library landscape) · `03-DSL` (spec + impl notes + gaps) · `04-Product` (Implementation/Unified plans, feature specs, roadmap) · `05-Archive` (the genesis Investigation Report) · `06-Reference` (a ~113-note encyclopedia of color models & systems — the data behind `/models`). When a design/decision question comes up, **check the vault first**; `model-docs.ts` / `channel-docs.ts` / `encyclopedia.ts` are distilled from `06-Reference`.

## Gotchas

- Run gates from the repo **root** (`turbo` fans out). `turbo.json` sets `agentGuidance: false` so `turbo` stops writing an `AGENTS.md`; build tasks see only env vars listed in `turbo.json` (`BASE_PATH`), so a new build-time var must be added there.
- **Scheme colours are frozen.** Never call a mutating method on `e.color` (or a preview's colours) in app code: start from `to(Model)` or `clone()`. A mutation throws a TypeError at the call site.
- **DSL snippets in UI copy and emitters** (Welcome hero, tool codegen in `components/tools/`, `scheme/flow.ts` scaffolds, `dsl/emit.ts`) must be new-DSL and must `clone()` before a mutating call, or the inserted code silently changes its source colour. `tests/migrate.test.ts` checks the shipped examples need no upgrade.
- **Package unit conventions** (ADR-004): percentages are 0–1 fractions, including `Hsluv` / `Hpluv` `s` and `l` and `Cmyk.totalInk()`. The studio's old values were 0–100.
- Theme/mobile detection happens **only after mount** on purpose; don't read `matchMedia`/`localStorage` during render.
- **A UI role override beats the DSL, not the other way round** (`deriveScheme`'s `mergeRoles` / `applyOverrides`). It used to be inverted, which silently made every Preview dropdown a no-op the moment a `roles {}` block existed. Overrides are per mode (`app.roles` / `app.darkRoles`) — a new preview surface must bind `app.modeOverrides`, never `app.roles` directly, or it will edit light while showing dark.
- **`ui.embed` / `ui.sourceLocked` are the embed's two kill-switches.** `embed` suppresses every write that would leak an iframe's presentation into the visitor's own studio (`chromatics:theme` + `chromatics:ui` in `+layout.svelte`, the auto-opening welcome modal) **and** the reads that would override the embed's URL params; `sourceLocked` makes `tools/shared.ts#insert` a no-op and hides the Design System scaffold CTAs. Any new persistence write in `+layout` or new source-mutating panel must respect them, or an embed will start writing to its host's visitors.
- **Branding lives in three places that must agree**: `static/favicon.svg`, `static/og.{svg,png}`, and the in-app `.brand-dot` conic gradient (Desktop + mobile shells). If you change the brand colors/mark, update all of them (and regenerate `og.png`).
- **`docs/chromatics/` is a tracked Obsidian vault, not app code** — don't let it be swept into refactors or "cleanups"; it's deliberately outside `src/`.
- Conventional-commit titles + short bullet bodies; **no AI/Claude self-attribution** in commits.

## Maintaining this file

Treat CLAUDE.md as living docs. **After any change that alters the points above** — new/removed route, tab, lib module, state store, persistence key, gate/command, or a new gotcha — update the relevant section in the same change. Keep it concise (orientation, not exhaustive); avoid brittle specifics that rot (prefer "see `/models`" over hard counts where you can). When a test/model count is cited, refresh it from the last gate run.
