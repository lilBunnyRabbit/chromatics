---
tags: [decision-log, adr, architecture, dsl, engine, strategy]
status: living
updated: 2026-06-24
---

# Decision Log

ADR-style log of the load-bearing decisions behind Chromatics. Each entry has an ID (`CD-NN`), a status (`Decided` | `Reversed` | `Open`), a date, and the usual Context / Decision / Rationale / Consequences. Decisions trace to real artifacts (branches, files, the [[Investigation Report]] synthesis). For the deeper reasoning behind individual entries see [[Build vs Buy]] and [[Architecture Decisions]]; for unresolved forks see [[Open Questions]].

> [!note] How to read this
> Status reflects the *evidence*, not aspiration. Where the shipped code (`color-testing/test-dsl`) and a spec disagree, the code wins and the spec is marked as needing correction. "Decided" means an artifact actually commits to it; "Open" means the synthesis (`investigation.json`) still lists it as an unresolved fork — those link [[Open Questions]].

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

> [!tip] See also
> [[Investigation Report]] (full evidence + synthesis) · [[Build vs Buy]] (the central wrap-vs-rebuild fork) · [[Architecture Decisions]] (engine/registry internals) · [[Open Questions]] (every Open entry above) · [[DSL Gaps & Bugs]] (the verified correctness gaps these decisions create).
