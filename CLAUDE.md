# CLAUDE.md

Guidance for working in this repo. **Keep it current** — see _Maintaining this file_ at the bottom.

## What this is

**Chromatics** — a scriptable **color language** (a small JS-subset DSL) plus an **interactive studio** for designing, analyzing and exploring color. Write a tiny program that derives a whole palette from one brand color; inspect any color across ~100 color models; check accessibility; preview it on real UI — all in the browser. Stored canonically in **OKLCH**; every other space is a lazy [culori](https://culorijs.org/) projection.

Also shipped **as a library**: the color engine under `src/lib/models` is exported as a Svelte package (culori sits behind one seam, the registry).

## Repo, branch & deployment

- **This is the canonical repo: `lilBunnyRabbit/chromatics`.** The app was first committed on the **`the-final-decision`** branch (the same branch that holds the research vault `docs/chromatics/`), and is **merged into `master`** from there. `master` is the deploy branch; `the-final-decision` is where the port + vault live together.
- **Provenance.** The app was developed in the separate `lilBunnyRabbit/color-testing` repo (the DSL half on `test-dsl`, the display half on `master`, then merged) and **ported here**. `color-testing` is the old/abandoned location — do not push there; work happens here.
- **Deployment.** `.github/workflows/deploy.yml` builds on push to **`master`** and publishes to **GitHub Pages** at `https://lilbunnyrabbit.github.io/chromatics/`. `BASE_PATH` is derived from the repo name (`/${{ github.event.repository.name }}` → `/chromatics`), so the base path follows the repo automatically — don't hardcode it. (The `github-pages` environment only allows `master`/`dev` to deploy.)
- **Branding / meta / assets** (keep in sync if branding changes):
  - `static/favicon.svg` — the brand mark: a rounded-square **conic color wheel** matching the in-app `.brand-dot` (`conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d)` in `DesktopShell.svelte` / mobile `MobileShell.svelte`).
  - `static/og.png` (1200×630, dark `#0f1115` theme) + its source `static/og.svg` — the social card referenced by the Open Graph / Twitter tags.
  - `src/app.html` — global `<head>`: description, OG/Twitter tags, `theme-color`, icons. Per-route `<title>` is set via `<svelte:head>` (`/`, `/mixer`, `/models`); the home title is `Chromatics — color as code`.
  - Absolute URLs in OG tags hardcode `https://lilbunnyrabbit.github.io/chromatics/` — update them if the deploy URL changes.

## Stack

SvelteKit 2 + **Svelte 5 runes** + TypeScript + **Bun** + CodeMirror 6 + culori + Tailwind v4 + `adapter-static` (static SPA, deployed to GitHub Pages on push to `master`).

## Commands / gates

Run from the **repo root** (the Bash shell cwd can drift into subdirs — `cd` first):

```sh
bun install
bun run dev            # dev server
bun test               # unit tests (bun:test) — currently 273 across 22 files
bun run check          # svelte-kit sync + svelte-check (expect 0 errors / 0 warnings)
bunx vite build        # static build → build/  (also: bun run build)
bun run format         # prettier --write
```

Before calling any change done: **`bun test` + `bun run check` + `bunx vite build` all green.** Note: Bun resolves `./x.js` imports to `x.ts`.

## Architecture

### Color engine — `src/lib/models/`

The hybrid "A+C" design. Immutable, OKLCH-stored color values + a data-driven model registry + one runtime view class.

- `value.ts` — `ColorValue` (immutable; canonical `_oklch`; lazy `project(mode)` cache; `channel`/`view`/`member` dispatch; `.hex/.inGamut/.gamutMapped/.toCSS`). **Channel accessors and per-model views (`c.oklch`, `c.lab`, `c.ok_h`, …) are resolved dynamically at runtime via `member()` — they are NOT on the static TS type.** In typed `.ts`/`.svelte` code, `c.oklch.lighten(…)` will fail `svelte-check`; only the DSL evaluator reaches them. If you need a value's hex in component code, derive it through the DSL (`evaluate`) or use typed methods.
- `view.ts` — `ModelView`, the single runtime class (channel → method → cross-model re-entry).
- `registry.ts` — the **only** culori importer; `toMode/getModel/allModels/CHANNELS/register/defineModel` + gamut helpers.
- `types.ts`, `families.ts`, `util.ts` — model/method/channel defs, op-tables + factories, coercions.
- `defs/*.ts` — one file (or group) per model; `defs/index.ts` barrel side-effect-registers all. `modes/` holds custom culori modes.
- **~100 registered models & systems** (stable + experimental + coming-soon stubs). Adding a model is a pure data file that auto-surfaces everywhere via the DSL manifest (proven by an anti-drift test).

### DSL — `src/lib/dsl/`

- `evaluator.ts` — acorn parse → controlled AST walk (no raw `eval`); per-statement try/catch; returns `EvalResult`. Also desugars **block scoping** — `tokens { … }` / `component { … }` / `preview { … }` / `roles { … }` (a length-preserving rewrite to a labeled statement, so offsets/line numbers are untouched). The first three are **builder** blocks: the namespace's members are called **bare** (`ramp(c)` ≡ `preview.ramp(c)`) and each line becomes a top-level variable. `roles { role = color }` is a **mapping** block: the RHS is captured as a color *name* (not evaluated) and the block aggregates into one `roles` theme-config variable. The dotted forms (`preview.x`, `tokens.x`, `token()`, `scale.x`, `theme({…})`) all still work.
- `environment.ts` — constructors generated from `manifest.constructors` + free fns (`mix`/`contrast`/`deltaE`/math).
- `manifest.ts` — **the single source of truth**: constructors/builtins/members/docs, built from `allModels()` + `CHANNELS`. An anti-drift test asserts everything stays in sync.
- `lang.ts` / `complete.ts` / `hover.ts` / `swatch-deco.ts` / `block-scope.ts` / `editor-bindings.ts` — CodeMirror language, autocomplete, hover docs, inline color markers, the **block-aware editor** seam, and the bindings the editor consumes. `block-scope.ts` (manifest-driven, no drift) tells both the highlighter and autocomplete which `label { … }` block wraps the cursor: inside a builder block the bare members highlight as methods + complete first; inside `roles {}` role keys complete on the left, named colors on the right.
- `preview.ts` — `preview.*` primitives that render as cards. `components.ts` / `tokens.ts` / `theme.ts` — the `component.*` / `tokens.*` / `theme()` namespaces for the styleguide. **`tokens.*`** is the canonical design-token namespace (`text`/`space`/`radius`/`shadow` + `token()` for arbitrary groups); `scale.*` and the free `token()` are kept as back-compat aliases. `tokens`/`component`/`preview` each work as a dotted namespace **or** a builder `name { … }` block; `roles { role = color }` is a mapping block (alias of `theme({…})`).
- `model-docs.ts`, `channel-docs.ts`, `encyclopedia.ts` — vault-distilled copy for docs & `/models`.
- `color.ts` — **legacy**, kept only as a test parity oracle; dead in the app.

### Other libs

- `analysis/` — `contrast`/`wcag`/`apca` (WCAG 2 + APCA), `cvd` (color-vision sim), `similarity` (ΔE), `print` (CMYK proof), `quantize` (image→palette).
- `scheme/` — `adapter` (`EvalResult`→`Scheme`), `roles` (role mapping + audit), `tokens`, `components`, `theme-config`.
- `export/` — CSS / DTCG / Tailwind / Markdown (`index.ts`), swatch SVG/PNG (`swatch.ts`), styleguide (`styleguide.ts`). Colors serialize through one `serializeColor(entry, ColorFormat)` seam: **as-defined** (authoring model when it's valid CSS — see `isCssColor` — else a selectable fallback model) or **single model** (`CSS_COLOR_MODELS`); long floats rounded.
- `mixer/engine.ts` — shared by `/mixer` and `/models`. `render/resolve.ts` — shared ref resolver.
- `persistence/` — `documents` (the per-doc store: `DocEnvelope`s keyed by a stable id + a rebuildable index; debounced autosave, idempotent migration, library import/export — pure & unit-tested), `url-hash` (shareable links), `local-storage` (first-run welcome flag). Keys: `chromatics:doc:<id>`, `chromatics:index`, `chromatics:active`, `chromatics:schema`, `chromatics:theme`, `chromatics:ui`, `chromatics:welcomed`. Legacy `chromatics:last` / `chromatics:scheme:<name>` are migrated into documents on first load (left in place one release as a safety copy).

### State — `src/lib/state/` (runes singletons)

- `app.svelte.ts` — `app`: `source` → `result` → `scheme`, then all the `$derived` role/token/component/audit state. **No panel mutates the scheme**; everything downstream is derived.
- `docs.svelte.ts` — `docs`: the active document + a recency `index`. Owns the single debounced autosave effect (gated on `docs.hydrated`) that writes `app.source` **plus** the per-doc Preview/Studio/Styleguide settings (`roles`/`opacities`/`visionSim`/`fgOpacity`) back to the active doc's own slot, and the new/open/rename/delete/duplicate/import/export lifecycle. `app.source` stays the single editable root; `docs` is the persistence seam around it.
- `ui.svelte.ts` — `ui`: theme, resizable/collapsible editor, active `Tab`, swatch mode, and the `mounted`/`isMobile` viewport gate.
- `welcome.svelte.ts` — `welcome.open` for the first-run showcase modal.

### UI — `src/routes/` + `src/lib/components/`

- `+layout.svelte` — applies/persists theme + ui prefs; flips `ui.isMobile` via `matchMedia` **after mount** (SSR/first render stays desktop → no hydration mismatch); renders the global `<Welcome/>`.
- `+page.svelte` — mount-gated shell chooser: `DesktopShell` vs mobile `MobileShell`.
- `DesktopShell.svelte` — top bar (`DocControls`, Share, Mixer/Models links, **?** welcome, theme) + drag-resizable/collapsible editor (its header carries the **API reference** toggle → `Docs` overlay) + tabbed analysis pane. The Inspector's "watch it cascade" flash diffs through `$lib/util/cascade` (`diffCascade`), which retains its baseline while the scheme is mid-edit-invalid so the flash survives an error blip.
- `DocControls.svelte` — shared document bar/sheet (`variant: 'bar' | 'sheet'`): recency switcher, inline rename, Saved/Saving chip, Save/New, new-from-template, duplicate, delete-with-confirm, library import/export, storage + cross-tab chips. Driven entirely by the `docs` store; used by both shells so save UX never drifts.
- Analysis tabs (shared by both shells via `ui.tab`): progressive disclosure splits them into `PRIMARY_TABS` (**Inspector · Studio · Preview · Styleguide · Export**) and `ADVANCED_TABS` (**Matrix · Validate**), defined in `ui.svelte.ts`. Desktop shows the primary set + a "More" overflow popover for advanced; mobile shows the first four primary in the bottom bar + the rest in the More sheet. Plus `Docs.svelte` (DSL reference overlay). The 3-D **`ModelViewer`** is **not** a tab — it lives on `/models`, pinned to the selected model.
- `components/mobile/` — `MobileShell` + `BottomTabBar` (5 slots) + `MoreSheet` (overflow + app actions) + `MobileEditorSheet` + `Sheet`.
- `Welcome.svelte` — first-run **welcome showcase modal** (rendered in `+layout`). Hero "color as code" card + a feature grid; each card jumps to the relevant tab/route and loads a tailored example. Auto-opens once (`hasWelcomed`/`markWelcomed`), re-openable from the **?** button in every header. A11y: `role=dialog`, focus trap, Esc/backdrop close, body-scroll lock.

### Routes

| Route     | What                                                     |
| --------- | -------------------------------------------------------- |
| `/`       | The studio — editor + analysis tabs                      |
| `/models` | Encyclopedia of all color models & systems (+ 2-D gamut plane & 3-D `ModelViewer` per model) |
| `/mixer`  | Cross-model mixer — one color, every model, live sliders |

Examples live in `src/routes/examples/` (Overview, Simple, Conversions, Showcase, Previews, Design System, Dynamic Theme); `examples/index.ts` orders them (first = default on load). The old Brand Dark/Light templates were removed; the Brand Dark source survives as `tests/fixtures/brand-dark.ts`, the parity oracle for the golden-hex + role-mapping tests.

## The research vault — `docs/chromatics/`

An **Obsidian vault** (markdown, not part of the build — `adapter-static` only prerenders `src/routes/`) that is the project's "second brain": every idea, decision, and plan from the run that produced Chromatics. **Preserve it** — it's the in-depth investigation this project grew out of, and it's the source behind a lot of the in-app copy. Start at `docs/chromatics/Home.md`. Structure: `00-Overview` (Vision, Project History, Status & Inventory, Glossary) · `01-Decisions` (Decision Log, _Build vs Buy_ → wrap culori, Architecture Decisions, Open Questions) · `02-Knowledge` (color science, accessibility, color theory, library landscape) · `03-DSL` (spec + impl notes + gaps) · `04-Product` (Implementation/Unified plans, feature specs, roadmap) · `05-Archive` (the genesis Investigation Report) · `06-Reference` (a ~113-note encyclopedia of color models & systems — the data behind `/models`). When a design/decision question comes up, **check the vault first**; `model-docs.ts` / `channel-docs.ts` / `encyclopedia.ts` are distilled from `06-Reference`.

## Gotchas

- **`package.json` `sideEffects` must keep `"**/models/**"`** — otherwise the model registry is tree-shaken out and the static build crashes on boot (`No constructor registered for oklch`).
- Run gates from the repo **root**.
- Dynamic color accessors (`.oklch`, `.ok_h`, …) don't exist on the static type — see the engine note above.
- Theme/mobile detection happens **only after mount** on purpose; don't read `matchMedia`/`localStorage` during render.
- **Branding lives in three places that must agree**: `static/favicon.svg`, `static/og.{svg,png}`, and the in-app `.brand-dot` conic gradient (Desktop + mobile shells). If you change the brand colors/mark, update all of them (and regenerate `og.png`).
- **`docs/chromatics/` is a tracked Obsidian vault, not app code** — don't let it be swept into refactors or "cleanups"; it's deliberately outside `src/`.
- Conventional-commit titles + short bullet bodies; **no AI/Claude self-attribution** in commits.

## Maintaining this file

Treat CLAUDE.md as living docs. **After any change that alters the points above** — new/removed route, tab, lib module, state store, persistence key, gate/command, or a new gotcha — update the relevant section in the same change. Keep it concise (orientation, not exhaustive); avoid brittle specifics that rot (prefer "see `/models`" over hard counts where you can). When a test/model count is cited, refresh it from the last gate run.
