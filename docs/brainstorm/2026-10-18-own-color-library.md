# Own color library
**Date:** 2026-10-18
**Participants:** @lilbunnyrabbit, Claude

## Context

The studio's engine (`src/lib/models/`) wraps culori. The owner wants their own npm package instead: _"Now that the models are smarter i want to make my own npm package for colors."_ Before deciding anything, the earlier hand-written iterations, the vault and the current engine were investigated. Full findings: [Library Investigation](../chromatics/04-Product/Library%20Investigation.md).

## Ground rules (owner)

- Build the package on a branch first, then turn this repo into a monorepo hosting the package and the website.
- Support every color model and color system, except proprietary ones (Pantone).
- Bulletproof: in-depth tests of every model's boundaries, every conversion, everything.
- The API is the most important factor; the owner is in every architectural decision.
- Brainstorm subagents may run on Fable during implementation.
- Agent rules modelled on webos (`../webos`), tuned for package development, camelCase.

## Investigation takeaways

- The owner's models always extended **typed arrays** (`Float32Array`, `Uint8ClampedArray`), never `Array`. v3 switched to composition (`private channels: Float32Array`). CD-04 later rejected typed arrays (Float32 drift, byte rounding, the `map()` constructor trap).
- `to` / `from` naming recurs from v3 on: `c.to(Model)`, `Model.from(c)`. The other recurring shape is the fluent `c.to.hsl()` proxy from `dev-dev`.
- A conversion registry filled by importing model modules recurs in every generation; path-finding first appears in the current engine's BFS (`registry.ts`).
- Separate float and 8-bit models (`RGB` / `RGB255`), but `dump.md` says "no rgb255".
- Parser registry with priority + `canParse`, and the idea of auto-detecting a pasted string's model.
- Every hand-written generation died with no tests and unverified, AI-drafted math.
- Implementation Plan §0 rejected a class per model because typing "is irrelevant in a dynamically-typed DSL". That premise doesn't hold for a TS library.

## Topics discussed

### Agent rules

Decided: the webos system, adapted. `docs/PRINCIPLES.md`, `docs/CONVENTIONS.md`, `docs/adrs/`, `docs/brainstorm/`, `docs/ROADMAP.md`, `docs/inbox.md`, and the rule sections in `CLAUDE.md`. The vault stays as research and history; new decisions are ADRs. Package-specific additions: _Numbers need sources_ and the per-model test matrix.

Proposed by Claude, not yet confirmed by the owner: ADRs at top-level `docs/adrs/` rather than continuing the vault's `CD-NN` log.

### API grill, first round

Asked, answered "no preference" on all four before the owner paused the session to set up these rules. Re-ask with the new brief-first format:

1. Representation: typed class per model + dynamic wrapper / class per model only / single tagged color / plain objects + functions.
2. Storage: readonly Float64 fields / private Float64Array / fields + coords tuple / extend a typed array.
3. Conversion syntax: `c.to(Model)` + `Model.from(c)` / fluent `c.to.lab()` / free `convert()` / method + function.
4. Mutability: immutable + `with()` / mutable + `clone()` / immutable + mutable builder.

### Grill 1: representation (decided)

Brief: today's `ColorValue` is one tagged class with runtime `member()` dispatch, so channels aren't on the TS type (46 `.channel()` sites, ~164 casts). Implementation Plan §0 rejected class-per-model on a DSL-only premise.

Options: A plain objects + functions, B tagged generic `Color<M>`, C class per model + abstract base, D typed classes + separate dynamic wrapper. Claude recommended C; argued against it: method bloat (class methods don't tree-shake), `instanceof` dual-package hazard, the DSL still needs a runtime manifest.

Decisions:

- **C: one class per model, extending an abstract `Color` base.** `parse()` returns `Color`; narrow with `c.is(Lab)`.
- **Library users first.** The DSL is an adapter in the app that maps onto package calls; the package doesn't bend for it.
- **Everything is bound to the color's own class** (owner): _"all methods and everything should be bound to color class. I hate the pattern we had with dsl like someColor.hsl.l"_. No cross-model views (`c.hsl.l`, `c.oklch.lighten()`); reading another model's channel means converting: `c.to(Hsl).l`. This also settles most of "where operations live" (methods, not free functions), accepting that unused methods ship with their class.
- **Custom models: not in v1.** The model contract stays internal; opening it later is additive.

How `is()` narrows was settled in grill 14 (model tag compare).

### Grill 2: storage, mutability, construction (decided)

The owner first picked private `Float64Array` storage, noting _"i still like the extending arrays idea … unless you have a good reason not to?"_ and _"I thought there was performance and storage benefits to typed arrays"_. Claude raised: extending a typed array clashes with the `Color` base (single inheritance), index writes bypass setters, the species trap on `map()`, serialisation loses the class. Then measured instead of arguing (`scratchpad/bench/bench.mjs`, 1M colors):

| Storage | V8 alloc | V8 B/color | V8 convert | JSC alloc | JSC B/color | JSC convert |
|---|---|---|---|---|---|---|
| Plain fields | 59 ms | ~112 | 40 ms | 20 ms | ~56 | 31 ms |
| Private `Float64Array` | 140 ms | ~288 | 55 ms | 25 ms | ~136 | 36 ms |
| `extends Float64Array` | 126 ms | ~256 | 51 ms | 41 ms | ~88 | 41 ms |
| One shared buffer | 5 ms | 32 | 38 ms | 5 ms | 32 | 31 ms |

A typed array is two heap objects (view + `ArrayBuffer`), so one per color is bigger and slower than plain fields on both engines. The typed-array win is bulk: many colors in one buffer. That's a possible separate batch type later, not single-color storage.

Decisions:

- **Plain number fields**, plus a static channel list and a `coords` getter for generic math.
- **Mutable.** Setters write in place; `clone()` copies.
- **Operations mutate the receiver and return `this`** (`c.lighten(0.1).rotateHue(30)` changes `c`; `c.clone().lighten(0.1)` keeps it). `to(Model)` necessarily returns a new instance of the target class.
- **Positional constructor, alpha last**; object form through a separate static (`Oklch.of({ … })`, name open) because `from()` is conversion.
- **8-bit models are real classes** (`Srgb8`-style), converting to and from their float model.

Consequences to carry into later rounds: conversion results can't be cached on the instance without invalidation; the DSL adapter must `clone()` at its boundary to keep dependency tracking sound; binary ops (`mix(other)`) mutate the receiver, not the argument; rounding/clamping semantics for byte models belong to the ranges round.

### Grill 3: conversions and routing (decided)

Options: A parent tree (colorjs.io style), B edge graph + BFS (today), C tree + declared shortcuts. Claude recommended A; argued against it: two-parent models (HCT, HSLuv), fixed Bradford adaptation, parameterised conversions.

The owner picked B: _"one registry makes most sense … for the cases where we can either go trough the parent and there is a direct mathematical definition to go trough one to the other - hue models are good example of this"_. Claude split B into two questions (graph vs tree; where edges live and how the registry is filled), since the global side-effect registration is what broke the prod build.

Decisions:

- **Edge graph + BFS, one internal registry.** Direct edges between siblings (Hsl ↔ Hsv) sit beside parent routes.
- **Edges are static data on the class**, collected lazily: the first `to()` walks outward from the classes it touches, fills the registry, caches the path. No side-effect imports; tree-shakes per model.
- **`c.to(M)` and `M.from(c)`**, class arguments only, no string ids.
- **`c.to(SameModel)` always returns a new instance** (colors are mutable; never alias).
- **Per-call options on `to()`**, typed per target model: `c.to(Lab, { white: 'D65', adaptation: 'cat16' })`, `c.to(Cam16, { La: 20, surround: 'dim' })`. The owner: _"this will be interesting to make type safe. if it will be impossible to define we do it with parameters on model."_ Claude proved it type-checks under `tsc --strict` (`scratchpad/typesketch/sketch.ts`): wrong-model options, options on an option-less model, and bad enum values are all compile errors; `Lab.from(c)` is typed through a `this` parameter.
- **Listing conversions is required** (owner: a UI that says "I have this model, I can convert it to all these"). That's why the old code used a global registry. Decided: a `chromatics/all` entry point exports every model as an array, and graph queries take the set explicitly: `reachable(Hsl, models)`, `path(Hsl, Lab, models)`.
- **Constraint found:** edges declared on both sides make a circular ES-module import (`Cannot access 'Hsl' before initialization` from a static field). Each edge is declared once, on the more derived model; the registry adds the reverse. Importing `Hsl` alone never pulls in `Hsv`.

### Grill 4: out-of-range, hue, greys, byte rounding (decided)

Brief: today nothing is clamped, `displayable()` needs eps 1e-5 for float noise, grey hue is culori's `undefined` coerced with `?? 0` in four places. The 2024–25 setters clamped hue and divided RGB by its max, silently distorting out-of-gamut conversions.

Decisions:

- **Out-of-range values stay raw.** `inGamut()` reports; `clamp()` and `gamutMap()` fix on request (both mutate, per Grill 2).
- **Hue wraps on set into [0, 360).** Nothing can store a hue outside it: 345 rotated by 30 is 15. Interpolation strategies (`longer`, …) work on deltas, not stored hue.
- **Grey hue is 0, never NaN.** The owner: _"i think nan would break logic for a lot of people. this is safer and still correct?"_ Claude: safer yes, not fully correct. 0 is a real hue, so white → blue in OKLCH would pass through magenta (the bug CSS fixed with `none`). Resolution: **store 0, and hue-sensitive operations (mix, gradients, harmony) treat hue as missing when chroma is below an epsilon**, taking the other color's hue. `isAchromatic()` is public. The epsilon is an ADR number.
- **Byte models round and clamp on set** (`new Srgb8(127.6, 300, -4)` → 128, 255, 0). The router must never route a path **through** a byte model, only to or from one.

Note: the preview wrote `mix(w, blue)` as a free function; per Grill 1 it's a method (`w.mix(blue, 0.5)`, mutating `w`).

### Grill 5: names and units (decided)

Decisions:

- **Class names: PascalCase words**: `Oklch`, `Oklab`, `Srgb`, `LinearSrgb`, `DisplayP3`, `Rec2020`, `Hsl`, `Hsv`, `Hwb`, `Lab`, `Lch`, `Xyz50`, `Xyz65`, `Cam16`, `Hct`, `Hsluv`, `Ycbcr`, `Ictcp`, `Cmyk`, `Srgb8`. By the same rule xyY is `Xyy` (the preview wrote `XyY`).
- **Channel names: the spec's letters, case-sensitive**: `l c h`, `a b`, xyY's `x y Y`, CAM16's `J C h Q M s`. An explicit exception to the camelCase rule: channels are math symbols, and formulas read 1:1.
- **Units: the spec's ranges, percentages as 0–1 fractions**: `new Hsl(30, 1, 0.5)`, `new Cmyk(0, 0.5, 1, 0.1)`, Oklch L 0–1 (CSS), Lab L 0–100 (CIE). CSS strings convert `%` on parse and format. Hue in degrees.

Rejected: standard capitalization (`OKLCH`, `YCbCr`: recognisable but irregular), all-caps, lowercase-with-renames (`xyy.luminance`), descriptive names with letter aliases, percent 0–100, Lab L as 0–1.

### Grill 6: where operations live (decided)

Two traps found while working it out:
- TS mixins can't carry `private` / `protected` members through `.d.ts` emit (TS4094), which a published package needs.
- A method on `Color` that uses `Lab` is a circular import (`color.ts` → `lab.ts` → `color.ts`, `Cannot access 'Color' before initialization`) and would drag the Lab chain into every bundle.

Decisions:

- **Shallow family base chain**: `Color → CylindricalColor | RectangularColor | RgbSpace … → model`, model-specific extras on the class. Cost accepted: single inheritance, so a model that belongs to two families (Hsl: hue-cylindrical and sRGB-derived) gets the second family's operations by delegation.
- **Binary operations take the same model, enforced by type**: `mix(other: this, t)`. `a.mix(b)` with `b: Lab`, `a: Oklch` is a compile error; convert explicitly, `a.mix(b.to(Oklch), 0.5)`. The working space is always visible at the call site.
  - Constraint: TS is structural, so `Lab` and `Oklab` (both `l a b alpha`), and `Srgb` / `LinearSrgb` / `DisplayP3` (all `r g b alpha`), would be assignable to each other. Each class declares a literal model tag (`readonly model = 'lab'` typed as the literal) so `this` parameters actually discriminate.
- **Metrics live on the model whose math they are**: `bg.to(Srgb).contrast(fg)`, `a.to(Lab).deltaE2000(b)`, `a.to(Oklab).deltaEOk(b)`. Metric arguments are **same model, typed**, like `mix` (decided in grill 7): `bg.to(Srgb).contrast(fg.to(Srgb))`. Claude recommended converting the argument (the metric fixes its space, so nothing is hidden); the owner chose one rule for every two-color method.

### Grill 7: parsing, formatting, equality (decided)

- **Parsing: per class + an `all` parse.** `Oklch.parse(str)` reads only Oklch syntax and returns `Oklch` (throws otherwise); `parse(str)` from `chromatics/all` reads any syntax and returns `Color`.
- **Formatting: `toString()` is lossless in our syntax** (`cam16(50 30 120)`, round-trips through `parse`); **`toCss()` is always valid CSS**, converting when the model has no CSS form. For CSS-native models the two are the same.
- **Equality: exact + perceptual.** `a.equals(b)` is exact (every channel `===`); perceptual sameness is a separate ΔE-based check (`looksSame`, deltaEOk below a JND; threshold is an ADR number). By the metric rule it lives on `Oklab` and is same-model typed: `a.to(Oklab).looksSame(b.to(Oklab))`, unless the owner wants it on every class (that would need the Oklab chain in every bundle).

### Grill 8: errors, hex, gamut mapping (decided)

- **Bad input throws.** `parse` throws `SyntaxError`; constructors and setters throw `TypeError` on `NaN` / `Infinity`. Non-throwing `tryParse` for user input.
- **`tryParse` returns `Optional<T>` from `@lilbunnyrabbit/optional`** (owner's own package, owner proposed it). Claude checked v1.0.1: zero deps, ~3.3 KB gz unminified, `get()` returns `null` when empty, **CommonJS only**, so it doesn't tree-shake and goes through interop in an ESM bundle. An ESM build of `@lilbunnyrabbit/optional` is worth doing before the package ships. First approved runtime dependency.
- **Hex belongs to `Srgb8`**: `Srgb8.parse('#ff8000')`, `toString()` / `toCss()` / `toHex()` give `'#ff8000'`; `parse('#ff8000')` (all) returns `Srgb8`. CSS `rgb()` parses to float `Srgb`. From anything else: `c.to(Srgb8).toHex()`.
- **Gamut operations live on RGB-space classes** (`Srgb`, `DisplayP3`, `Rec2020`, …): `inGamut()`, `clamp()`, `gamutMap()` (CSS Color 4 §13, OKLCH chroma reduction internally), mutating that color. `c.to(Srgb).gamutMap().to(Oklch)` for display mapping. Claude recommended `oklch.gamutMap(Srgb)` staying in OKLCH; the owner kept the class-bound rule.

### Grill 9: name, format, exports, tooling (decided)

npm: unscoped `chromatics` is taken (someone else's v1.0.2, 2022); `@lilbunnyrabbit/chromatics` is free.

- **Name: `@lilbunnyrabbit/chromatics`.**
- **ESM only**, `"sideEffects": false` (possible because edges are static class data, nothing registers on import).
- **Root barrel + `/all` + per-model subpaths** (`@lilbunnyrabbit/chromatics/oklch`, `/lab`, …). Claude noted subpaths aren't needed for tree-shaking with `sideEffects: false`; the owner wants them anyway. The exports map has to be generated from the model list, not hand-kept.
- **Vitest, run on both engines** (node/V8 and bun/JSC). Reason: `Math.pow` / `cbrt` / `exp` are implementation-approximated, so V8 and JSC can differ in the last bit; exact golden tests must pass on both. Vitest is a new dev dependency, approved here. The build tool wasn't answered (tsc per-file vs a bundler) and stays open.

### Grill 10: build, test strategy (decided)

The owner delegated two answers to Claude ("what you think is optimal", "optimal and most bulletproof"); those are marked.

- **Build: `tsc` per file** (delegated). One `.js` + `.d.ts` per source file, so per-model subpaths map 1:1 with no bundler dependency. A minified CDN build is left out until someone asks for one.
- **Oracles: per model, offline fixtures.** Each model names its source (colour-science; hsluv.org's tests; material-color-utilities for HCT; Ottosson's reference code for Oklab / okhsl / okhsv; CSS Color 4 examples). A generator script (`uv` + Python where needed) writes JSON fixtures carrying source, version, function, and precision. Tests read JSON only and never call Python.
- **Tolerances come from the source's precision**: reference checks use half the last published digit (each fixture carries its `precision`); round-trips use a tight relative epsilon (ADR number).
- **Inputs: all three layers** (delegated; most bulletproof): hand-written boundaries / corners / degenerate cases, a deterministic grid over each model's domain, and property-based round-trips with `fast-check` (fixed seed in CI, shrinking on failure). Each model ships a domain generator. `fast-check` is a new dev dependency, approved by this delegation.
- **Migration:** a culori baseline dump guards the studio's golden hexes (already in CLAUDE.md).

### Grill 11: color systems and licensing (decided)

Claude's grouping (an understanding, not legal advice; verify each source before shipping):
1. Public: CSS / X11 named, Munsell renotation (1943, RIT), ISCC-NBS, US FS 595, xkcd survey (CC0).
2. Grey zone: RAL Classic, NCS, BS 381C / BS 4800, ANSI Z535.
3. Proprietary, out: Pantone, HKS, DIC, Toyo, Copic.

Decisions:

- **Group 1 ships.**
- **All four grey-zone systems may ship**: RAL Classic, NCS (**notation and approximate conversion only, no licensed sample table**), BS 381C / BS 4800, ANSI Z535. Each value still needs a citable public source in its fixture; a system with no clean source waits.
- **Group 3 stays out.**
- **Catalog API: a class with static `get` / `nearest` / `all`.** `get(code)` returns a color in the catalog's reference model; `nearest(c)` returns `{ code, color, deltaE }` by ΔE2000 in Lab; `all()` returns readonly entries. Munsell is also a model (`Munsell.parse('5R 4/14').to(Oklch)`). Open detail: where an entry's name lives (`get()` returns a plain color, so name/code metadata needs its own accessor or field).

### Grill 12: multi-color results, interpolation (decided)

- **Several results are always new instances; the receiver is untouched.** The rule: one result mutates and returns `this` (`c.complement()`), several results are new (`c.triadic()`, `c.ramp(11)`, `a.steps(b, 9)`).
- **Interpolation: `mix` + `steps` + `interpolator`**, same-model typed. `a.mix(b, t, opts)` mutates `a`; `a.steps(b, n, opts)` returns `T[]` including both ends; `a.interpolator(b, opts)` returns `(t) => T`, a new instance per call; multi-stop is a static, `Oklch.gradient([a, b, c], n)`.
- **Alpha is premultiplied** (CSS Color 4 §12.3), so mixes match browser `color-mix()` and gradients; today's studio interpolates straight.
- **Hue strategy defaults to `shorter`**; `longer` / `increasing` / `decreasing` per call. Grey hue detection (Grill 4) applies.

### Grill 13: location, release, versioning, dependencies (decided)

- **`packages/chromatics/` with Bun workspaces now.** The studio stays at the root and consumes the package via `workspace:*`; the later monorepo step only moves the app to `apps/web`.
- **Changesets + npm trusted publishing (OIDC)**, set up before the first publish. No long-lived `NPM_TOKEN` (the 2024 token is what failed `optional`'s release).
- **`0.x` until the API is frozen**, then `1.0.0`.
- **Runtime dependencies: none besides `@lilbunnyrabbit/optional`.** Dev: TypeScript, Vitest, fast-check (approved in grills 9–10).

### Grill 14: leftovers, order, migration (decided)

- **`c.is(Lab)` compares model tags** (`this.model === M.id`), so it works across duplicate package copies. Known cost: a narrowed value may be another copy's class.
- **Object-form constructor: `Oklch.of({ l, c, h, alpha? })`.**
- **Build order: core first, then families.**
  1. `Color` base, router, parse / format, and about 14 core models (`Xyz65`, `Xyz50`, `Srgb`, `LinearSrgb`, `Srgb8`, `Oklab`, `Oklch`, `Lab`, `Lch`, `Hsl`, `Hsv`, `Hwb`, `DisplayP3`), each with the full matrix.
  2. Wide-gamut RGB.
  3. Further perceptual models.
  4. Appearance models.
  5. Video, print, catalogs.
- **Studio migration: big bang at parity.** Culori stays in the app until the package covers everything the app uses; then one PR switches. Claude recommended incremental swaps behind `registry.ts`; the owner chose one clean cut over a half-culori period.

### Grill 15: package file layout (decided 2026-10-19)

- **A folder per model, flat** (no family level; family lives in the base class): `src/models/oklch/{oklch.ts, oklch.test.ts, oklch.domain.ts, oklch.fixtures.json, README.md}`. `src/core/` holds `color.ts`, `edge.ts`, `router.ts`, `families/`; `src/index.ts` is the root barrel; `src/all.ts` holds `models`, `parse`, `reachable`, `path`; `scripts/fixtures/` holds the oracle generators. Tests sit beside their source.
- Rejected: folder per model under family (the 2025 `dev-dev` layout; re-grouping moves files), flat files with a separate `tests/` (the studio today).

### Grill 16: sourced numbers (decided 2026-10-19)

An Opus research agent checked CSS Color 4 (ED and TR, 2026-10-09), colorjs.io 0.7.1, culori 4.0.2, ColorAide 8.13.1, Chromium, WebKit, Stylo and colour-science, and measured float noise on V8 and JSC (`scratchpad/research/`, `scratchpad/scripts/noise.mjs`). The owner picked the matrix source and delegated the rest (_"dont know whats best decide"_). Values and citations are in the revisions of ADR-003, ADR-006 and ADR-008:

- Matrices: CSS Color 4 64-bit where published, others derived and verified (owner). Found trap: Ottosson's 10-decimal matrices round-trip at 1.2e-4 relative near black.
- Achromatic threshold: CSS values, `≤` (Claude).
- `inGamut`: 7.5e-5 per channel (Claude).
- `looksSame`: deltaEOk < 0.02 (Claude).
- Round-trip: `|a − b| ≤ 1e-13 + 1e-12·|b|`, per-model looser bound with reason (Claude).

### Grill 17: scaffold findings (decided 2026-10-19)

Found while scaffolding `packages/chromatics`:

- **Undeclared studio imports.** Bun's isolated workspace linker only links direct dependencies, and `svelte-check` failed on `@codemirror/view` / `state` / `commands` and `estree`, which the studio imported without declaring. Decided: declare them at the installed versions (vs. switching back to the hoisted linker).
- **Script types:** Bun-only scripts with `@types/bun` (owner; Claude had proposed `@types/node`).
- **Bradford:** the owner asked for _"the most precise and correct. No shortcuts"_, so the exact rational derivation ships, not CSS's float-computed decimals (≤ 3.2e-16 apart). sRGB and P3 match the CSS rationals exactly.
- **Router determinism (a bug Claude found in its own first version):** searching the global graph made a route depend on what else had been converted. Now a route depends only on its two models. `path(from, to)` returns that exact route (owner), dropping the `models` argument.
- JSDoc (owner): public API documented for IntelliSense in `/** */` blocks: units, ranges, mutation, throws, examples; never restating the signature. Recorded in CONVENTIONS.

### Grill 18–21: model internals and test tooling (decided 2026-10-19)

Opened before writing the first models.

- **Grill 18: channel writes are validated by accessors** (owner). The conflict: ADR-003 says setters throw on `NaN` / `Infinity` and wrap hue, but ADR-001 says storage is plain fields, and a plain field can't validate a write. Measured over 10M read+write ops (`scratchpad/bench/accessor.mjs`): plain fields 25 ms on V8 and 60 ms on JSC, validating accessors 100 ms and 250 ms. Decided: a private backing field with a validating get / set, plus `toJSON()` returning `{ model, ...channels, alpha }`, so JSON doesn't leak `_h` keys. Rejected: plain fields checked only at operations (`c.h = 400` reads 400, and `NaN` surfaces far from its write); accessors on hue only (two rules to remember).
- **Grill 19: rich static channel metadata, keyed by name** (owner). `static readonly channels = { l: { range: [0, 1] }, c: { range: [0, 0.4] }, h: { range: [0, 360], hue: true } } as const`. Key order is the constructor / `coords` order, and a test pins it. `range` is the CSS reference range, documented as not enforced. One source feeds the studio sliders, the harness's boundaries and grid, and the domain generators. The owner asked for the object over an array of `{ name }`; rejected: names only (range tables drift), English labels (copy in a math library).
- **Grill 20: a shared `describeModel(Model, spec)` harness** (owner) runs every row of the matrix; model-specific cases are written by hand beside it. The harness has its own test, which feeds it deliberately broken models and expects each row to fail. Rejected: hand-written tests per model (a forgotten row goes unnoticed across 100 files).
- **Grill 21: no Python for the core models** (owner). Reference vectors are published spec values at their own precision: CSS Color 4 examples and tables, Ottosson's XYZ→Oklab table, the CIE / ASTM worked values. A **culori grid dump**, generated once by a Bun script, is a labelled secondary cross-check (owner) that catches formula bugs that still round-trip. It is never a reference, and it doubles as ADR-008's migration-parity baseline. Python and colour-science may come back for later families with few published vectors; not decided.

## Key takeaways

- The package is a typed, class-per-model, mutable, chainable API. Every operation is bound to the color's own class, and two-color operations are same-model by type.
- Conversion is an edge graph declared as static class data, so it tree-shakes with no global side effects; graph queries take an explicit model set from `/all`.
- Numeric policy: never silently lose data (raw out-of-range values, explicit clamp / gamutMap); hue wraps; grey hue is 0 with chroma-based "no hue" detection; byte models round and clamp.
- Measured, not assumed: per-color typed arrays are bigger and slower than plain fields on both V8 and JSC. Typed options on `to()` are proven to type-check.

## Still open

- Where a catalog entry's name and code live when `get()` returns a plain color.
- The DSL adapter's shape (clone at the boundary, `member()` onto class methods, the snake_case `ok_l` keys). Decided at migration time.
- A packed batch type (one shared `Float64Array` for many colors): deferred until a consumer needs it.

## Action items

- [x] Investigation
- [x] Agent rules
- [x] API grill rounds 1–14
- [x] ADRs for the decided rounds: [ADR-001…010](../adrs/README.md)
- [ ] Owner review of PRINCIPLES / CONVENTIONS / CLAUDE.md rule sections
- [ ] `@lilbunnyrabbit/optional` 1.1.0 (ESM build) is versioned on master but unpublished: the publish got 404, so no trusted publisher is configured. Set one up on npmjs.com (tick "also allow npm publish"), then bump and release. The package depends on it.
- [x] Source the open numbers (grill 16)

## Next session topics

- Review the ADRs
- Sourced constants
- Scaffold `packages/chromatics` and the core models
