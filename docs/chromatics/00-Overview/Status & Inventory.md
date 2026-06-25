---
tags: [overview, inventory, status, artifacts, repos, branches]
status: living
updated: 2026-06-24
---

# Status & Inventory

The living catalogue of *every* Chromatics artifact across both repos and the Obsidian archive, with a maturity rating and a keep / reference / retire verdict for each. This is the "what exists and is it real" map; for the *story* of how it got here see [[Project History]], for the *why* of the strategic calls see [[Decision Log]], and for the color-knowledge corpus see [[Color Knowledge Hub]].

> [!tip] How to read this
> Two Git repos hold the whole project: **chromatics** (`@lilbunnyrabbit/chromatics` — the npm library + the DSL spec) and **color-testing** (the webapp; the *only* working DSL lives here). A third store is the user's **Obsidian** knowledge base (`docs/chromatics/old/`), which this vault is distilled from. The state/role columns below are taken verbatim from `investigation.json → synthesis.artifactStates` (the source of truth).

---

## Master inventory table

| Repo | Branch / location | Path / area | What it is | Maturity | Role in the vision | Verdict |
|---|---|---|---|---|---|---|
| color-testing | `test-dsl` | `src/lib/dsl/{evaluator,color,lang}.ts`, `Editor.svelte`, `routes/+page.svelte` | **The working DSL** — acorn evaluator + OKLCH/culori `Color` + CodeMirror REPL + dep-tracking inspector | Active, functional **v0.0.1** prototype (2026-06-24) | **The de-facto Phase 1+2+3 product.** The single REAL DSL implementation that exists; where the vision is actually realized | **KEEP** — this is the product |
| color-testing | `master` | contrast matrix, `oklch.ts`, `demo/`, 7 `schemes/*.ts` | **Color Scheme Tester** — N×N contrast matrix, WCAG AA/AAA, CVD sim, opacity slider, markdown export, realistic previews | Stable, shipped (2026-03-06) | Origin of the accessibility framing (WCAG, gamut, CVD) carried into the DSL; UI-pattern donor; the "missing bridge" | **REFERENCE** — mine its analysis surfaces (matrix, audit, CVD) to fold back into the DSL |
| chromatics | `tmp` | `DSL.md` (15,686 B) | **DSL design document** — the formal blueprint (parse-as-JS, dep DAG, two-way editing roadmap) | Mature spec; **ZERO implementation behind it on its own repo** | The blueprint the `test-dsl` code independently implements. Has internal contradictions | **REFERENCE** — keep as spec-of-record, but [[DSL Spec]] must correct it to match the code |
| chromatics | `tmp` | `src/packages/chromatics/` | Cleanest engine refactor — `ColorModelBase` + symbol-ref registry singleton | Active but only **sRGB↔sRGB8** wired; real `get()` bug | Intended runtime engine; **NOT used by the working DSL** (bypassed for culori) | **REFERENCE** — architecture worth keeping, breadth not there |
| chromatics | `origin/dev-dev` | typed-array engine | **Engine high-water mark** — ~8–12 models, `ParserRegistry`, `.to` proxy, React+Svelte playgrounds | Most feature-complete but "mostly all AI", abandoned registry migration (2025-03-15) | Intended runtime engine (older keying design) | **REFERENCE** — the breadth ceiling; mine for model coverage if the engine is ever built |
| chromatics | `origin/dev` | typed-array engine | First from-scratch TS color library — static constructor-keyed `ConversionRegistry` | WIP, superseded (2025-02-16) | Predecessor of `dev-dev` | **RETIRE** — superseded by `dev-dev` |
| chromatics | `origin/v3-test` | registry rewrite | Ground-up symbol-`ref`-keyed registry | WIP, **breadth regression** to sRGB/sRGB8 only (2025-12-11) | First cut of the architecture `tmp` cleaned up | **RETIRE** — folded into `tmp` |
| chromatics | `origin/research` | `_old/research/*` markdown | Founding brief + spec-1..5, all-1..6, deep/, conversions.md, TODO.md | Settled/archival ideation | The exploration that fed direction; conceptual SEED of the DSL | **REFERENCE** — archived into `old/`; see [[Color Knowledge Hub]] |
| chromatics | `master` | npm-package-template | The literal origin — empty scaffold, README "npm-package-template" | Frozen at initial commit (2024-02-19) | The floor the whole project grew from | **KEEP** (as published-package skeleton) / inert |
| chromatics | `the-final-decision` | (checked out) npm template + `docs/` | **This vault's home** — currently still `4767521`, identical to `master` | Label only; vault not yet committed here | Consolidation branch — destined to hold the docs vault + the "wrap culori" decision | **KEEP** — the consolidation target |
| Obsidian | `docs/chromatics/old/` | `Chromatics.md`, `Chromatics - Planning.md` | **Planning notes** — the 2026 note is the clearest committed strategy | Mature, decisive | **Current source-of-truth direction.** REVERSES the from-scratch decision in favor of wrapping culori | **KEEP** — primary; the code follows THIS, see [[Decision Log]] |
| Obsidian | `old/chromatics/AI/` | Ideas / Existing Products / Dynamic Theme / Library Research v1-5 | AI deep-research dumps; versioned passes that tapered off | Settled/archival; internally contradictory | Exploration that fed direction; origin of from-scratch + "No AI" stances (both later overridden) | **REFERENCE** — see [[Library Landscape]], [[Open Questions]] |
| Obsidian | `old/chromatics/Research/` | Conversion Pipeline, Transfer Functions, Chromatic Adaptation, Gamut Mapping, deltaE, Harmony, Interpolation, Contrast | **Engine-internals research** — dense, direction-setting, each ends with concrete recommendations | Mature, internally consistent (Apr 8 2026) | Algorithm spec for the eventual full library; **mostly UNUSED by the prototype** (delegated to culori) | **REFERENCE** — see [[Color Science & Algorithms]], [[Accessibility]] |
| Obsidian | `old/chromatics/Color Models/` + `Color Systems/` | **102 notes** (73 models + 29 systems), each with a `## Chromatics API` block | Encyclopedic reference + aspirational class hierarchy | Rich but mid-consolidation (2-3 unmerged legacy blocks per note) | Aspirational implementation spec for the full class-per-model engine; vastly outpaces any code | **REFERENCE** — the project's deepest asset; see [[Color Models]] |

---

## What is load-bearing today vs aspirational

> [!note] Load-bearing = a user can actually run it right now.
> Almost everything specced is reference material; the running product is a thin slice of the corpus.

**Load-bearing today** (in `color-testing/test-dsl`, all verified in code):

- The **acorn-based evaluator** (`evaluator.ts`: `ecmaVersion 2020`, `sourceType 'module'`, restricted node-type walk, `Unsupported syntax: <type>` catch-all).
- The **OKLCH `Color` model** wrapping **culori v4.0.2** (`color.ts`: private `_oklch`, lazy/cached HSL/RGB/hex; all math in OKLCH space).
- **Dependency tracking** — the project's stated core novelty — actually shipped: `Scope.currentDeps → Variable.deps → "depends on: x, y"`.
- The **CodeMirror 6 REPL** (`Editor.svelte`) + **live debounced inspector** (100 ms) with swatches, gamut/P3 badges, and a heuristic theme PREVIEW.
- **WCAG contrast** (culori `wcagContrast`) and **gamut/P3 flags**.
- The **Color Scheme Tester** on `color-testing/master` (separate, also runs): contrast matrix, CVD simulation, markdown export.

**Aspirational** (specced/researched, **no running code**):

- The **from-scratch chromatics engine** at full breadth — `tmp` wires only sRGB↔sRGB8 against a 102-model encyclopedia; the perceptual core (Oklab/Oklch, XYZ hub, P3) and conversion-graph pathfinding are **unbuilt**.
- **Two-way UI↔code editing** — the headline differentiator everywhere in spec/planning, with **zero code and zero supporting algorithm research**.
- **Export** (CSS vars / JSON tokens / Tailwind) and **persistence/sharing** (URL-hash, localStorage) — none exist.
- **APCA, CVD, harmony/tonal-palette generators**, and CSS Color 4 **gamut mapping** in the DSL surface.
- The **"Dynamic Theme"** product (full accessible theme from a few base colors) — only the brittle name-based PREVIEW gestures at it.

> [!warning] Two verified correctness gaps in the *running* code
> - `shift()` / `derive()` are **uncallable from the DSL** — `color.ts` defines them taking object literals `{l,c,h}`, but `evaluator.ts` has **no `ObjectExpression` case**, so `shift({h:30})` throws `Unsupported syntax: ObjectExpression`. They are advertised in API Docs + the highlighter but dead.
> - The **highlighter (`lang.ts`) and evaluator maintain two independent, manually-synced token sets** that already drift; some after-dot branches are effectively dead.
>
> See [[DSL Gaps & Bugs]] and [[Open Questions]] for the full list and proposed fixes.

---

## The defining tension this inventory exposes

> [!decision] Two repos, two implementations of one idea
> The DSL **spec** lives in `chromatics` and names `chromatics` as its engine — but the only **working DSL** lives in `color-testing` and wraps **culori**, never touching the chromatics `ConversionRegistry`. The build-from-scratch vs wrap-a-library fork was decided by the shipped code and the 2026 planning note ("the DSL is the novel contribution — the conversion math is not") in favor of wrapping. Yet the from-scratch engine still exists on the active `tmp` branch as a sunk-cost pull the other way.
>
> Recorded as the central strategic call in [[Decision Log]] and [[Build vs Buy]]; the open form of "which engine / which repo" sits in [[Open Questions]] and [[Architecture Decisions]].

---

## Related notes

- [[Project History]] — the dated, era-by-era narrative behind these artifacts.
- [[Decision Log]] / [[Build vs Buy]] / [[Architecture Decisions]] — the calls that produced the verdicts above.
- [[Color Knowledge Hub]] → [[Color Models]], [[Color Science & Algorithms]], [[Accessibility]], [[Library Landscape]] — the reference corpus.
- [[DSL Spec]] / [[DSL Implementation Notes]] / [[DSL Gaps & Bugs]] — the deep dive on the load-bearing code.
- [[Open Questions]] — the unresolved forks. · [[Investigation Report]] — the synthesis this note draws from.
