---
tags: [decision-log, adr, architecture, dsl, engine, strategy]
status: living
updated: 2026-06-29
---

# Decision Log

ADR-style log of the load-bearing decisions behind Chromatics. Each entry has an ID (`CD-NN`), a status (`Decided` | `Reversed` | `Open` | `Proposed`), a date, and the usual Context / Decision / Rationale / Consequences. Decisions trace to real artifacts (branches, files, the [[Investigation Report]] synthesis). For the deeper reasoning behind individual entries see [[Build vs Buy]] and [[Architecture Decisions]]; for unresolved forks see [[Open Questions]].

> [!note] How to read this
> Status reflects the *evidence*, not aspiration. Where the shipped code (`color-testing/test-dsl`) and a spec disagree, the code wins and the spec is marked as needing correction. "Decided" means an artifact actually commits to it; "Open" means the synthesis (`investigation.json`) still lists it as an unresolved fork — those link [[Open Questions]]. **"Proposed"** (CD-12 onward) is accepted *direction* for roadmap work not yet built — it records the intended decision and its load-bearing constraints, to be promoted to "Decided" when an artifact commits. See [[Roadmap]].

## Index

| ID | Title | Status |
|----|-------|--------|
| [[#CD-01 — Wrap culori, don't build the engine from scratch]] | Engine: wrap culori | Decided |
| [[#CD-02 — OKLCH as the canonical color workspace]] | OKLCH canonical | Decided |
| [[#CD-03 — Parse user input as a JS subset (acorn + AST walk)]] | acorn AST walk | Decided |
| [[#CD-04 — REVERSE the TypedArray-backed color model]] | Reverse TypedArrays | Reversed |
| [[#CD-05 — OKLCH channel naming: ok_l / ok_c / ok_h]] | ok_* naming | Decided |
| [[#CD-06 — Object literals allowed only as call arguments]] | Object-literal scope | Open |
| [[#CD-07 — Symbol-ref vs constructor-keyed conversion registry]] | Registry keying | Decided (regressed) |
| [[#CD-08 — Reframe "No AI" → "every color has a rationale"]] | Positioning reframe | Open |
| [[#CD-09 — Consolidate the working DSL in color-testing (for now)]] | Repo of record | Decided |
| [[#CD-10 — chromatics is the published library long-term]] | Library home | Open |
| [[#CD-11 — Unified product: merge master display + test-dsl DSL]] | Unified product | Open |
| [[#CD-12 — Shared spine: pure scheme derivation + a validated source-rewrite layer]] | Shared spine: derive + rewrite | Proposed |
| [[#CD-13 — Design-system mode as a first-class flow]] | Design-system mode | Proposed |
| [[#CD-14 — Scheme diff & versioning]] | Scheme diff & versioning | Proposed |
| [[#CD-15 — Visual ↔ code round-trip]] | Visual ↔ code round-trip | Proposed |

---

## CD-01 — Wrap culori, don't build the engine from scratch
**Status:** Decided · **Date:** 2026-04-08 (planning note) / 2026-06-24 (shipped)

**Context.** Chromatics began (2024–2025) as a from-scratch TypeScript color library — typed-array models + a hand-built `ConversionRegistry` (`chromatics` branches `origin/dev`, `origin/dev-dev`, `origin/v3-test`, `tmp`). A 100+-note color-science knowledge base specs the full XYZ-hub pipeline. See [[Library Landscape]], [[Color Science & Algorithms]].

**Decision.** The DSL runs on **culori (v4.0.2)**, not the bespoke engine. `src/lib/dsl/color.ts` imports `converter`, `formatHex`, `clampChroma`, `wcagContrast`, `displayable`, `inGamut`, `parse` straight from culori and never touches the chromatics registry.

**Rationale.** The 2026 planning note: *"The DSL is the novel contribution — the conversion math is not"* and *"reimplementing is 6–12 months and still have bugs."* The engine-research independently concluded *"Wrap Culori rather than reimplement."* The shipped code follows the planning note. See [[Build vs Buy]].

**Consequences.**
- The from-scratch engine (symbol-ref registry on `tmp`, sRGB↔sRGB8 only, plus a latent `get()` bug) is **not used by the working DSL** — a sunk-cost pull in the opposite direction.
- Model-specific methods culori under-exposes (`hct.tonalPalette`, `oklch.gamutMap`, `lab.deltaE`, APCA, CVD) become a *thin layer on top of* culori, added on demand — the genuine differentiator, requiring zero re-derived converters.
- The from-scratch engine survives as an optional learning track, not a blocker. The synthesis recommendation: *"stop treating the from-scratch chromatics engine as a blocker."*

**Related:** [[#CD-04 — REVERSE the TypedArray-backed color model]], [[Build vs Buy]], [[Architecture Decisions]], [[Open Questions]] (engine-backing fork).

---

## CD-02 — OKLCH as the canonical color workspace
**Status:** Decided · **Date:** 2026-04-03 (spec) / 2026-06-24 (shipped)

**Context.** A single internal color space is needed so all transforms compose predictably.

**Decision.** **OKLCH is canonical.** `Color` stores a private `_oklch` (culori `Oklch`); HSL / RGB / hex are lazily derived and cached (`_hsl`, `_rgb`, `_hex`). All operations — `lighten`/`darken` (adjust `ok_l`), `saturate`/`desaturate` (`ok_c`), `rotate`/`invert`/`complement` (`ok_h`), `mix`/`shift`/`derive` — compute in OKLCH space.

**Rationale.** Perceptual uniformity. Full convergence across spec, planning note, engine-research (*"Oklab/Oklch as default perceptual workspace"*), and code — the encyclopedia tags Oklab "Critical — default interpolation space" and Oklch "Critical — default for gamut mapping." See [[Color Models]], [[Color Science & Algorithms]].

**Consequences.** `mix()` uses shortest-arc hue interpolation; hue wraps via `((h % 360) + 360) % 360`. No clamping on `ok_l`/`ok_c` yet — values can run `<0` or `>1`, only badged out-of-gamut (see [[DSL Gaps & Bugs]]).

**Related:** [[DSL Spec]], [[DSL Implementation Notes]].

---

## CD-03 — Parse user input as a JS subset (acorn + AST walk)
**Status:** Decided · **Date:** 2026-04-03 (spec) / 2026-06-24 (shipped)

**Context.** The DSL needs JS-familiar syntax (zero learning curve) but full introspection for dependency tracking and source mapping.

**Decision.** Parse the source as JavaScript with **acorn** (`ecmaVersion: 2020, sourceType: 'module', locations: true`), then **walk the ESTree AST** with a custom controlled interpreter. Supported node types: `Literal`, `Identifier`, `Unary`/`Binary`/`Logical`/`Conditional`, `MemberExpression`, `CallExpression`, `AssignmentExpression`, `ExpressionStatement`. Anything else throws `Unsupported syntax: <type>`.

> [!decision] Two alternatives explicitly rejected
> - **Raw `eval`** (`with(env)` + `new Function()`) — gives *"almost no introspection"*: can't track deps or map UI picks to source lines.
> - **A hand-written grammar** — too much maintenance *"for what is a strict subset of JavaScript anyway."*

**Rationale.** Zero strategic divergence across `DSL.md`, the planning note (*"same pattern as your DSL using Acorn"*), and `evaluator.ts`. The spec's evaluator sketch omitted ternary/comparison nodes; **the code added them** — so the code is ahead of the spec here.

**Consequences.** Flat global scope only — no loops, functions, or blocks; conditional logic via ternaries. Each top-level statement is `name = expr` or a bare expression, each evaluated in its own try/catch so one error doesn't kill the rest.

**Related:** [[DSL Spec]], [[DSL Implementation Notes]], [[Architecture Decisions]].

---

## CD-04 — REVERSE the TypedArray-backed color model
**Status:** Reversed · **Date:** 2026-04-08 (planning note)

**Context.** The founding brief (`origin/research:_old/research/ai/prompt.md`): *"color models … that extend typed arrays."* Library Research v2 and the 102-note encyclopedia mandate typed-array-backed models — fractional/angle models extend `Float32Array`, 0–255 models extend `Uint8ClampedArray`.

**Decision (reversal).** Move **away from TypedArrays toward plain `number` properties.** Keep TypedArray backing **only for batch / GPU export** paths.

**Rationale (from the 2026 planning note).** *"Float32 precision loss over long chains"* — chained conversions accumulate error. Plain number props are simpler and lossless for the relationship-graph use case. This **supersedes** the original typed-array decision baked into the existing `chromatics` engine code.

**Consequences.** The existing `chromatics` library is built the now-rejected way (models *are* typed arrays). The shipped DSL sidesteps this entirely by wrapping culori (see [[#CD-01 — Wrap culori, don't build the engine from scratch]]) — culori uses plain object color records, so the reversal is already honored in practice.

**Supersedes:** the original "models extend typed arrays" brief. **Related:** [[Build vs Buy]], [[Architecture Decisions]].

---

## CD-05 — OKLCH channel naming: ok_l / ok_c / ok_h
**Status:** Decided · **Date:** 2026-06-24 (resolved in code)

**Context.** `DSL.md` is **internally contradictory**: its accessor table reserves `.l` for HSL lightness, but *every* worked example reads OKLCH lightness/chroma/hue as `bg.l` / `bg.c` / `bg.h` — an unreconciled collision.

**Decision.** **OKLCH = `ok_l` / `ok_c` / `ok_h`; HSL = `h` / `s` / `l`.** Verified in `color.ts` getters (≈ lines 37–60). Shipped examples use the `ok_*` form correctly, e.g. `fg = OKLCH(1 - bg.ok_l, bg.ok_c / 3, (bg.ok_h + 180) % 360)`.

**Rationale.** Avoids the `.l` collision between HSL-lightness and OKLCH-lightness. The code already settled what the spec left open.

**Consequences.** `DSL.md` must be edited to match the code and delete the conflicting `.l/.c/.h`-for-OKLCH example forms (the spec is currently wrong here). Tracked in [[DSL Gaps & Bugs]].

**Related:** [[DSL Spec]], [[Glossary]].

---

## CD-06 — Object literals allowed only as call arguments
**Status:** Open · **Date:** undecided (recommendation logged 2026-06-24)

**Context.** `color.ts` defines `shift({l,c,h})` and `derive({l,c,h})` taking object literals (≈ lines 139–157), but `evaluator.ts` has **no `ObjectExpression` case**. Calling `shift({l:0.1})` from a script throws `Unsupported syntax: ObjectExpression`. **Both methods are dead from the DSL surface** — yet they're advertised in API Docs and the highlighter. `DSL.md`'s "no object/array literals" rule directly conflicts with its own `shift`/`derive` signatures.

**Decision (proposed, not yet implemented).** Add a **minimal `ObjectExpression` case restricted to identifier keys + primitive values**, i.e. *"object literals allowed only as call arguments."* Resolve `DSL.md`'s blanket "no object literals" rule to this narrower form.

**Rationale.** `shift({h: 30})` is the ergonomic, spec-intended form; named-channel clarity matters for color. The alternatives — positional `shift(dl, dc, dh)` or removing the methods — lose that clarity.

**Consequences.** Must update the highlighter and API Docs in the same change. Until done, `shift`/`derive` remain non-functional. Tracked in [[DSL Gaps & Bugs]]; decision pending in [[Open Questions]].

**Related:** [[DSL Implementation Notes]], [[Feature Specs]].

---

## CD-07 — Symbol-ref vs constructor-keyed conversion registry
**Status:** Decided (with breadth regression) · **Date:** 2025-12-11 (`v3-test`) → 2026-04-03 (`tmp`)

**Context.** Two competing engine-internal registry designs inside `chromatics`:
- **Constructor-keyed** (`origin/dev`, `origin/dev-dev`): `Map<Constructor, Map<Constructor, fn>>`. The breadth high-water mark — ~8–12 models, a `ParserRegistry`, a `.to` proxy.
- **Symbol-ref** (`origin/v3-test`, `tmp`): each model has `static ref = Symbol("srgb")`; registry keys `Map<symbol, Map<symbol, fn>>`, resolving from constructor or instance.

**Decision.** The active `tmp` ("dsl") branch commits to the **symbol-ref** keying, plus `ColorModelBase` (generic `static from()` / instance `to()` delegating to a shared singleton).

**Rationale.** Cleaner architecture; decouples keying from class identity.

> [!warning] Unresolved breadth regression
> The cleaner design **threw away all the breadth**: only **sRGB ↔ sRGB8** survive on `tmp`/`v3-test`; every other model, every parser, and the whole `ParserRegistry` were dropped. There is **no graph pathfinding** — only directly-registered edges work; multi-hop is manual chaining. The registry migration (*"Remove converters from models"*) was started and abandoned. This is engine-internal and **currently moot** because the DSL runs on culori (see [[#CD-01 — Wrap culori, don't build the engine from scratch]]).

**Consequences.** If chromatics ever backs the DSL, the perceptual core (Oklab/Oklch, XYZ hub, P3) plus automatic conversion routing must be built first. See the engine-backing fork in [[Open Questions]].

**Related:** [[Architecture Decisions]], [[Library Landscape]].

---

## CD-08 — Reframe "No AI" → "every color has a rationale / relationships as code"
**Status:** Open · **Date:** reframe recommended 2026-06-24

**Context.** `ideas.md` is emphatic: *"No AI — User in Control"*, *"a brand's palette is too critical to leave to an AI's guess"*, deterministic schemes only. But (a) the Existing-Products gap analysis floats natural-language AI palette prompts, and (b) the entire current knowledge base is literally *"By Claude Code"* AI-generated. The stance reads as a **pre-pivot artifact** in tension with everything newer.

**Decision (proposed).** **Reframe**, don't keep the absolute stance: *deterministic by default, optional AI assist for naming/suggestions only.* Drop "No AI" as a marketed pillar; promote the still-true differentiator: **"every color has a rationale / relationships as code."**

**Rationale.** The defensible core is the reactive dependency graph — *"color schemes as dependency graphs, not static palette picks… No existing tool does this"* — which is both promised and **actually built** (`Scope.currentDeps` → `Variable.deps` → "depends on:" UI). That, not an absolute anti-AI position, is the genuine wedge.

**Consequences.** Affects [[Vision]] and product positioning. Decision pending in [[Open Questions]].

**Related:** [[Vision]], [[Unified Product Plan]].

---

## CD-09 — Consolidate the working DSL in color-testing (for now)
**Status:** Decided (operational, near-term) · **Date:** 2026-06-24

**Context.** **Two repos, two implementations of one idea.** `DSL.md` lives in `chromatics/tmp` and names `chromatics` as the engine, but the *only working DSL* lives in `color-testing/test-dsl` and wraps culori. The repos don't share the engine they were "supposed" to share.

**Decision.** Operationally, **ship from `color-testing/test-dsl`** — the repo where the running code is. Keep `DSL.md` as the (to-be-corrected) spec of record. Don't disrupt momentum by force-fitting chromatics underneath.

**Rationale.** The working end-to-end artifact (acorn evaluator + OKLCH/culori `Color` + CodeMirror REPL + dependency-tracking inspector) is here and functional at v0.0.1. Synthesis recommendation: *"ship the DSL you already have, from color-testing/test-dsl."*

**Consequences.** This is a **near-term operational** call, not the end-state (see [[#CD-10 — chromatics is the published library long-term]]). The README in this repo is stale (still describes the old static app) — tracked in [[DSL Gaps & Bugs]].

**Related:** [[#CD-10 — chromatics is the published library long-term]], [[Status & Inventory]], [[Project History]].

---

## CD-10 — chromatics is the published library long-term
**Status:** Open (end-state intent) · **Date:** intent logged 2026-06-24

**Context.** `@lilbunnyrabbit/chromatics` (MIT, author Andraž Mesarič-Sirec) is the npm-published package name and the home of the engine + spec + 100+-note knowledge base. But it currently has **zero working DSL** and only sRGB↔sRGB8 conversion breadth.

**Decision (intended end-state, not yet acted on).** Long-term, the engine + model-specific methods live in the published `@lilbunnyrabbit/chromatics` package; the REPL webapp **consumes** it. Until chromatics exposes a `Color` API the webapp needs, keep the split (CD-09).

**Rationale.** The published-library identity, the package name, and the deepest research asset all live in chromatics. But the synthesis is explicit: only once chromatics *actually exposes* the needed API — *not* as a precondition for shipping.

**Consequences.** Blocked on the engine-backing fork (CD-01 / CD-07): chromatics must first implement the perceptual core + conversion routing. This is the consolidation `the-final-decision` is *named* for but **has not yet absorbed** (that branch currently resolves to the 2024 npm-package-template commit `4767521`, identical to `master`). See [[Open Questions]], [[Project History]].

**Related:** [[#CD-09 — Consolidate the working DSL in color-testing (for now)]], [[Build vs Buy]], [[Roadmap]].

---

## CD-11 — Unified product: merge master display + test-dsl DSL
**Status:** Open (direction) · **Date:** 2026-06-24

**Context.** Two complementary halves exist in `color-testing`:
- **`master`** — the Color Scheme Tester: N×N contrast matrix, WCAG AA/AAA, foreground-opacity slider, CVD/vision simulation, gamut/P3 flags, markdown export, role-mapped realistic previews (Landing/Dashboard/Blog) with a live audit panel. The **display/analysis** layer.
- **`test-dsl`** — the live REPL that *authors* schemes but only has a brittle name-substring `PREVIEW` heuristic for display.

**Decision (direction, scoping pending).** **Merge the two**: the DSL authors the scheme; the master app's contrast matrix + previews + audit + CVD become the analysis surface for DSL output. The shared data bridge already exists — `resolveGroups` accepts hand-written `OKLCH`, plain CSS strings, or `[name, css]` tuples.

**Rationale.** `test-dsl` *deleted* the scheme files, `oklch.ts`, and the demo route when it pivoted; the analysis surfaces are the obvious missing display half. Accessibility framing (WCAG, gamut, CVD) is a stable through-line worth preserving. See [[Unified Product Plan]], [[Product Architecture]].

**Consequences.** Also pulls in the still-unbuilt headline features: **two-way UI↔code editing** (zero code, zero supporting algorithm research — scope deliberately, start with Option A break-link-and-warn), **export** (CSS vars / JSON tokens / Tailwind), and **URL-hash persistence**. All tracked in [[Feature Specs]] / [[Roadmap]] and as open items in [[Open Questions]].

**Related:** [[Unified Product Plan]], [[Product Architecture]], [[Feature Specs]], [[Roadmap]].

---

## CD-12 — Shared spine: pure scheme derivation + a validated source-rewrite layer
**Status:** Proposed · **Date:** 2026-06-29

**Context.** Three "depth for the niche" roadmap items — first-class design-system mode (CD-13), scheme diff & versioning (CD-14), and visual↔code round-trip (CD-15), all in [[Roadmap]] — each need two capabilities the codebase does not yet expose cleanly: **(a)** render a Scheme *headlessly* from a `{source, settings}` pair, off Svelte's reactive graph; and **(b)** write changes *back into the DSL source* without corrupting it. Today the `source → result → scheme → roles/audit/tokens/components` chain lives only as `$derived` getters inside `state/app.svelte.ts` (see [[Product Architecture]]), and source mutation is ad-hoc (`dsl/emit.ts` `appendStatements`/`insert`).

**Decision.** Build two shared seams **first**, before any of the three features:
1. **`src/lib/scheme/derive.ts` — `deriveScheme(source, settings): RenderedScheme`** — a pure function bundling `evaluate → schemeFromEvalResult → resolveRoles/cssVars/auditPairs → tokens/components`. `app.svelte.ts`'s `$derived` chain is refactored to call it **1:1, zero behaviour change**, so the live UI and any headless caller run the *same* code.
2. **A validated, block-aware source-rewrite layer** — `dsl/source-span.ts` (a conservative literal-span gate) + `dsl/patch.ts` (`replaceSpan` / `editCallArg` / `upsertRoleLine` / `upsertTokensLine`), where every result is **re-parsed via `evaluate` before commit and aborts on parse error**. The existing `emit.ts insert()` (append) stays the third point on the rewrite spectrum.

**Rationale.** This is the one investment that pays off in all three features while preserving Chromatics' core invariant — the DSL source stays the single editable root, and nothing derived is ever persisted or mutated (see [[#CD-02 — OKLCH as the canonical color workspace]] and [[Architecture Decisions]] §1). A single `deriveScheme` is the **anti-drift cornerstone** of diffing (both sides of a diff derive identically); a single validated rewrite layer means no feature can splice broken source. Extracting it as a behaviour-preserving refactor is low-risk because the existing test suite guards it.

**Consequences.**
- **Build-order keystone.** `derive.ts` lands first, gated by `bun test` + `bun run check` + `bunx vite build`; then design-system mode P0 (CD-13); then the rewrite layer; then light/dark (CD-13 P1); then diff/versioning (CD-14). Each later feature consumes a seam built earlier.
- `RenderedScheme` becomes the home for the `dark*` outputs introduced by CD-13, so CD-14 (diff) and `export/` inherit dual-mode rendering for free instead of re-deriving.
- **Risk:** the extraction must be strict 1:1 — any drift between `derive.ts` and the live `$derived` chain would silently corrupt every diff. Mitigated by landing it as a pure refactor under green gates before any feature work.

**Related:** [[#CD-13 — Design-system mode as a first-class flow]], [[#CD-14 — Scheme diff & versioning]], [[#CD-15 — Visual ↔ code round-trip]], [[Architecture Decisions]], [[Product Architecture]], [[Roadmap]].

---

## CD-13 — Design-system mode as a first-class flow
**Status:** Proposed · **Date:** 2026-06-29

**Context.** The pieces of a design system already exist as scattered DSL namespaces (`roles {}`, `theme()`, `tokens.*`, `component.*`) and analysis tabs, but there is no opinionated end-to-end flow, and there is **no light/dark theming** today (see [[Product Architecture]], [[Feature Specs]]).

**Decision.** Reframe the **Styleguide tab as "Design System"** — a guided flow (Roles → Light/Dark → Components → Tokens → Handoff) layered over the *same* derived state, **not** a new pipeline. Step completeness is purely `$derived`; each unfinished step offers a one-click **Scaffold** that emits real DSL through the rewrite layer (CD-12) — auto role assignment → a `roles {}` block, default tokens → a `tokens {}` block. **Light/dark is modelled strictly as role-binding:** a new manifest-registered `theme.dark({…})` / `theme.light({…})` builtin re-points `bg/fg/surface/border` onto already-named colors, and both modes re-resolve through the existing `resolveRoles/cssVars/auditPairs`. Keep the tab id `styleguide`.

**Rationale.** A "mode" should be a richer *view* over derived state, not a fork of the Scheme — consistent with the single-source invariant ([[#CD-02 — OKLCH as the canonical color workspace]]). Modelling dark as re-binding (not a second Scheme) means zero new evaluation path and full audit reuse; adding `theme.dark()` as a manifest builtin keeps highlight / complete / anti-drift green **without touching the block desugarer** (see [[Architecture Decisions]] §5, [[DSL Spec]]).

**Consequences.**
- New: `scheme/flow.ts` (pure step model + scaffold strings), `scheme/modes.ts` (`effectiveRolesFor`, `modeFragilePairs`), `components/system/FlowSteps.svelte`. `app.svelte.ts` gains `dark*` `$derived` siblings (no new mutable state); these live inside CD-12's `RenderedScheme`.
- Data: `ThemeConfig` gains `mode?: 'light' | 'dark'`; optional persisted active `mode` in `DocSettings` (additive, undefined = light). Dual-mode CSS (`:root` + `.dark`) + DTCG `modes` at handoff.
- **Scope guard (MVP):** dark = roles-only re-pointing; per-mode tokens/components are out. The object-RHS form `roles { bg = { light, dark } }` is deferred (touches the evaluator/highlighter).
- **Risks:** scaffold collisions (detect an existing block → relabel "Edit in source"); dangling dark targets fall back to base (needs a hint, not a silent no-op); keep `dark*` out of the CVD `simScheme` map to avoid combinatorial recompute.
- **Phasing:** P0 guided flow, single theme · P1 light/dark + worst-of-both audit (mode-fragile pairs) · P2 handoff bundle + "derive dark from light" (OKLCH lightness inversion) + auto-adjust contrast (see *Unresolved* below).

> [!question] Unresolved — auto-adjust values to preserve accessibility scores
> **Idea (under exploration, not yet decided — still being thought through).** Make accessibility a *maintained invariant*, not a one-shot report: when a role changes (e.g. the user edits **bg**), any pair that drops below its target (say **bg/fg** or **bg/primary** falling out of **AAA**) auto-adjusts the *dependent* value's `ok_l` (and, if needed, `ok_c`) to climb back over the threshold — a live extension of the Phase-5 `enforceContrast` idea ([[Roadmap]] Phase 5) across the whole role graph, not just at generation time.
>
> **Open design questions (the "still thinking" part):**
> - **Where it runs.** *(a) Solve-at-derive-time* — a pure, non-destructive pass inside `deriveScheme` (CD-12) nudges flagged roles to clear the threshold without touching source: keeps the DSL canonical and is reversible, but the rendered value then *diverges from the authored expression*. *(b) Rewrite-source* — emit the adjusted value back through the CD-15 rewrite layer: source stays truthful, but it mutates the user's relationships. Lean (a) for an MVP; (b) only on explicit "bake in".
> - **Which side yields.** If editing **bg** breaks **bg/fg**, do we move **fg**, or was **bg** the intent? Needs a notion of *pinned* (the value just edited / explicitly locked) vs *free-to-adjust* roles — likely a per-role lock toggle, with the just-edited value pinned by default.
> - **Formula conflict.** If **fg** is *defined as* a formula of **bg** (`fg = bg.oklch.…`), auto-nudging **fg** fights its own definition. Options: adjust a parameter *inside* the formula, treat formula-bound roles as locked and move a different free role, or surface "can't satisfy — here's why".
> - **Constraint solving.** Many roles depend on **bg**; fixing one pair can break another → a small constraint system over the role graph, with real risks of conflict, no-solution, and oscillation. Must be **deterministic and idempotent** (re-running converges), prefer the minimal `ok_l` change, and respect gamut.
> - **Scope of the score.** Which target (AA vs AAA, body vs large text), which pairs, and **per-mode** — light *and* dark (worst-of-both, tying into the mode-fragile-pair audit above).
> - **UX.** Automatic vs *suggested* (one-click "fix" from an audit row — the existing P2 seed). Automatic risks surprising the user; suggested keeps them in control. Likely default: suggest, opt-in to auto.
>
> Mechanism depends on CD-12 (derive-time solve) and/or CD-15 (source rewrite); to be tracked in [[Open Questions]] once shaped.

**Related:** [[#CD-12 — Shared spine: pure scheme derivation + a validated source-rewrite layer]], [[#CD-14 — Scheme diff & versioning]], [[Roadmap]], [[Feature Specs]], [[Product Architecture]].

---

## CD-14 — Scheme diff & versioning
**Status:** Proposed · **Date:** 2026-06-29

**Context.** Users want to see what a brand-color change does across the whole derived system, checkpoint versions, and share/embed them (see [[Roadmap]]). A scheme is fully determined by `{source, settings}` — exactly the blob `state/docs.svelte.ts` `snapshotKey()` already serialises for dirty-tracking.

**Decision.** A "version" is a frozen `{source, settings}` snapshot; **nothing derived is stored**. Diffing = re-derive both snapshots via `deriveScheme()` (CD-12) and compare. Store versions as an additive `versions?: SchemeVersion[]` on the existing `DocEnvelope` (no new storage key; rides library export/import; capped, pinned exempt). Add a **History** tab + a **Snapshot** button in `DocControls`; the diff renders Palette (ΔE, L/C/H), Roles (re-target + dangling), and the headline **Contrast** section (audit pairs that crossed a WCAG band). Share via a new `persistence/url-hash.ts` `~2` payload that **captures settings**.

**Rationale.** Snapshots-not-derived preserves the single-source invariant and makes the accessibility delta ("Muted text 4.6 → 3.9, AA → fail") the headline payoff. Reusing `DocEnvelope` + `migrate()`'s additive tolerance avoids a schema bump. The `~2` link incidentally **closes the known gap** where `~0`/`~1` share links drop the creator's roles/opacities.

**Consequences.**
- New: `scheme/diff.ts` (`diffSchemes`), `components/History.svelte`, `export/diff-card.ts` (self-contained SVG, cloned from `export/swatch.ts`). Depends entirely on CD-12's `derive.ts`.
- Shape: `SchemeVersion { id, label, note?, source, settings, createdAt, pinned?, parentId? }`. **Restore** writes back through `app.source` (auto-snapshots first → non-destructive).
- Once CD-13 lands light/dark, the diff must compare **both modes**; because `dark*` lives in `RenderedScheme`, it inherits this.
- **Risks:** derivation drift (mitigated by CD-12); localStorage quota (cap + pinned + deflate-on-pressure, reusing url-hash's `CompressionStream`); audit pairs are label-keyed (treat missing/added labels as add/remove rows, never crash).
- **Phasing:** P0 `derive.ts` extraction + `diff.ts` + minimal History (contrast-regression list) · P1 full Palette/Roles diff + `~2` share + embeddable diff card · P2 version-vs-version, live diff-as-you-type, brand-knob scrubber, scriptable `preview.diff()`.

**Related:** [[#CD-12 — Shared spine: pure scheme derivation + a validated source-rewrite layer]], [[#CD-13 — Design-system mode as a first-class flow]], [[#CD-15 — Visual ↔ code round-trip]], [[Roadmap]], [[Product Architecture]].

---

## CD-15 — Visual ↔ code round-trip
**Status:** Proposed · **Date:** 2026-06-29

**Context.** Chromatics is one-directional today (code → visuals). A two-way edit was flagged as a headline gap in [[#CD-11 — Unified product: merge master display + test-dsl DSL]]. The round-trip is ~90% wired already: the evaluator keeps each variable's acorn node (character offsets) and `desugarBlocks` is length-preserving, so `node.right.start/.end` map 1:1 onto `app.source`.

**Decision.** Visual surfaces (color picker, role dropdown, token slider, draggable harmony node) rewrite the **exact source span they came from** via the validated rewrite layer (CD-12) — never append blindly, never mutate the Scheme. A conservative gate (`dsl/source-span.ts`) emits a span **only** when the RHS is a constructor call with all-literal args; derived colors (`brand.oklch.rotateHue(30)`) expose their numeric arg instead of being flattened. Every patch is **re-parsed before commit**.

> [!decision] Supersedes the old "break-link-and-warn" sketch
> [[#CD-11 — Unified product: merge master display + test-dsl DSL]] / [[Feature Specs]] proposed starting with *"Option A: break the link and warn"* on a visual edit. This decision replaces that with **span-preserving in-place rewrite** — relationships survive, because we edit the literal/arg rather than flattening the expression.

**Rationale.** Splicing the authored span keeps the relationship graph intact and the DSL the single source of truth ([[#CD-02 — OKLCH as the canonical color workspace]]). The infrastructure already exists (acorn offsets on `Variable.node`, length-preserving desugar, `swatch-deco` def-site widgets), so the work is a thin tool + one safe splice primitive — **not** new algorithm research.

**Consequences.**
- New: `dsl/source-span.ts` (the safety gate), `dsl/patch.ts` (splices), `dsl/edit-intent.ts` (minimal patch by value-shape), `components/tools/Edit.svelte`, `state/selection.svelte.ts` (cursor↔entry). `SchemeEntry` gains `span?` + a `valueShape: 'literal' | 'ctor' | 'derived' | 'other'`.
- No new DSL syntax, no new persisted keys — edits flow into `app.source` and ride existing autosave / url-hash / library.
- P2: the UI-only `app.roles` overrides become a staging buffer that **commits into the `roles {}` block** — finally landing roles in the DSL instead of parallel UI state.
- **Risks:** gate conservatism is the whole safety story (a span escaping for a non-literal expression would destroy a relationship); offset drift (resolve every patch against the live editor doc at commit, never a cached offset); block-desugar interplay (re-find blocks on the original source via `enclosingBlock`); coalesce drag frames into one undo group on pointer-up.
- **Phasing:** P0 literal-only in-place hex/ctor edits (derived read-only) · P1 ctor channel args + `rotateHue(n)` arg without flattening, CodeMirror transaction for native undo, swatch-click picker, draggable harmony node · P2 block-aware role/token upserts, flatten/lift actions, mobile parity.

**Related:** [[#CD-11 — Unified product: merge master display + test-dsl DSL]], [[#CD-12 — Shared spine: pure scheme derivation + a validated source-rewrite layer]], [[#CD-13 — Design-system mode as a first-class flow]], [[Feature Specs]], [[DSL Spec]].

---

> [!tip] See also
> [[Investigation Report]] (full evidence + synthesis) · [[Build vs Buy]] (the central wrap-vs-rebuild fork) · [[Architecture Decisions]] (engine/registry internals) · [[Open Questions]] (every Open entry above) · [[DSL Gaps & Bugs]] (the verified correctness gaps these decisions create).
