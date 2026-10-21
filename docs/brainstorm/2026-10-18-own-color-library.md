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

### Grill 22–25: parse and format details (decided 2026-10-19)

- **Grill 22: `none` parses to 0** (owner). `toString()` never emits `none`. A missing hue during interpolation comes from `isAchromatic()`, as decided. Known difference: a non-hue `none` (`rgb(none 0 0)` mixed with red) interpolates from 0, where a browser would take the other color's value. Rejected: a per-instance missing-channel bitmask (hidden state in `equals` / `clone` / `toJSON`); rejecting `none` (refuses valid CSS).
- **Grill 23: strings follow CSS, numbers are yours** (owner). Parsing applies CSS Color 4's parse-time clamps: L to its range, negative chroma to 0, alpha to 0–1, legacy `rgb()` to 0–255. Constructors and setters stay raw (ADR-003). Accepted cost: `parse(c.toString())` doesn't round-trip a color that was out of range when serialized.
- **Grill 24: `toString()` is shortest exact, `toCss()` is rounded** (owner). `toString()` writes each number as JS's shortest round-trip form, so it stays lossless. Percentages shift the decimal point in the string rather than multiplying by 100, because `x * 100 / 100 !== x` for 15% of random doubles (measured). `toCss({ precision })` rounds; the default is 5 significant digits relative to each channel's reference range, so Oklch L gets 5 decimals and hue gets 2 (precedent: colorjs.io's default precision of 5). For CSS-native models the two methods now differ only in digits; this revises ADR-006's "the two agree".
- **Grill 25: output uses the modern space-separated syntax, with `%` where the spec uses it** (owner): `hsl(30 100% 50%)`, `hwb(30 0% 0%)`, `oklch(0.7 0.15 30)`, `lab(50 20 -30)`; `Srgb` writes `color(srgb 1 0.5 0)`; `Srgb8` writes hex (ADR-006). Rejected: the legacy comma form; numbers-only `hsl(30 100 50)` (older browsers reject it).

### Grill 26–28: ids, named colors, toCss (decided 2026-10-19)

- **Grill 26: model ids are CSS idents** (owner): `'srgb-linear'`, `'display-p3'`, `'xyz-d65'`, `'xyz-d50'`. Where CSS has no name, they're lowercase kebab (`'srgb8'`, `'hsv'`, `'cam16'`). Parse dispatch is then a direct lookup. Rejected: camelCase of the class (two names for one space), lowercase class name.
- **Grill 27: named colors live on `Srgb8`** (owner). `Srgb8.parse('rebeccapurple')` works, and `parse('red')` from `/all` returns `Srgb8`. `transparent` is `Srgb8(0, 0, 0, 0)`; `currentcolor` throws. Rejected: a separate `/named` export.
- **Grill 28: only CSS-native models have `toCss()`** (owner: _"actually no toCss if not css color!"_). Claude had proposed a per-model CSS fallback (Hsv to `color(srgb …)`). Instead, `toCss()` leaves the `Color` base, and a non-CSS model converts explicitly: `hsv.to(Srgb).toCss()`. This revises ADR-006 ("`toCss()` is always valid CSS, converting when the model has no CSS form").

### Grill 29–32: numeric edge cases found by the harness (decided 2026-10-19)

The first full run of the test matrix (13 models, about 6,800 tests) turned up four questions:

- **Grill 29: conversions zero the hue below the achromatic threshold** (owner, as recommended). This matches CSS Color 4's sample code and browsers, so `#808080` gives `oklch(… 0 0)` instead of `h 89.87` from 1e-15 noise. Cost, measured: near-greys don't round-trip bit-exactly through a hue model (`srgb(0 0 1e-13)` → hwb → sRGB gives `srgb(1e-13 0 0)`). The error is bounded by the threshold: sRGB ≤ 1e-5, Oklab ≤ 8e-6, Lab ≤ 0.003, all far below a JND of 0.02.
- **Grill 30: round-trip tolerance is relative to the largest channel** (owner: "what you think its best"). The bound becomes `|aᵢ − bᵢ| ≤ 1e-13 + 1e-12·maxⱼ|bⱼ|`, with hue excluded and chroma-weighted. Reason: coupled channels carry their biggest neighbour's error. `Lab(200, 0, 0)` through XYZ returns `a = 1.1e-13`, because `a = 500·(fx − fy)` with fx ≈ 2; even plain white sits at the per-channel edge. Revises ADR-008.
- **Grill 31: in ill-conditioned regions, check the residual** (owner: "you decide whats best"). Where the source-space error fails, the harness checks `back.to(N)` against `c.to(N)` in the neighbour space (backward error). Cases:
  - Oklab near the LMS zero plane: imaginary colors inside the ±0.4 box, where the cube root amplifies float noise.
  - Hsl/Hsv at subnormal lightness, where saturation isn't representable.
  - Near-greys whose hue was zeroed (grill 29).

  Published-matrix inconsistency was ruled out by measurement: |M·M⁻¹ − I| ≤ 5e-16.
- **Grill 32: conversions are total** (owner: _"i dont want conversions and things to produce errors in such way"_). Fuzzing found two kinds of overflow:
  - **Spurious:** the result fits but an intermediate step doesn't, such as `sqrt(a² + b²)` above 1.3e154. These are removed: `Math.hypot` for chroma, and `min / 2 + max / 2` for HSL lightness.
  - **Genuine:** the true result is beyond the number range (sRGB 1e200 is 1e480 in linear light, and Hsv saturation from a subnormal maximum). These throw `RangeError: <from> → <to>: result exceeds the number range for <color>`. Previously they threw a misleading TypeError naming a channel the user never wrote.

  A harness row proves it per model: over every finite double, each conversion returns a finite color or throws exactly that RangeError. Within 1e6× the reference ranges, with no subnormal magnitudes, nothing throws.

Other findings from the same run:
- **Spec example `#ex-xyz` (CSS Color 4) is inconsistent beyond its own rounding.** Its XYZ values were derived from the rounded `lab()` member, not from `#7654CD`. The hex → `xyz-d50` z value is 0.44708, but the spec prints 0.4472. Those pairs are excluded from the fixtures with that reason; lab ↔ XYZ and hex ↔ lab are kept.
- **Reference tolerance** = the published half-digit (or WPT's asserted epsilon, whichever is larger), plus the spread of the published *input's* own rounding. Every corner of the input's half-digit box is converted. WPT inputs are test definitions and carry no spread.
- **Mutation testing** (break the code on purpose): 31 mutants. The first run left 9 alive, and each got a targeted, cited test: the Lab κ/ε junction, parse-time clamps, the HSL negative-saturation rotation, the achromatic thresholds, angle units, and alpha omission in output. Now 30 of 31 are killed; the survivor (the `+360` in `toPolar`) is equivalent code, because the constructor wraps hue anyway. The harness self-test also caught a gap in the harness itself: equal shape values per channel hid a swapped channel order.
- Formatting (owner): the package uses the owner's Prettier config (`packages/chromatics/.prettierrc`, 2 spaces, double quotes, width 120); the studio keeps its own.

### Grill 33–42: operations in detail (decided 2026-10-19)

ADR-005 settled where operations live; these rounds settled what they are.

- **Grill 33: adjustment methods, amount as a fraction of the reference range** (owner).
  - Methods: `lighten` / `darken` / `saturate` / `desaturate`, mutating and chainable.
  - Where: Oklch, Lch, Hsl (s, l); Hsv (s, v); Lab and Oklab (lighten / darken only); Hwb gets none.
  - Units: `lighten(0.1)` is +10% of the channel's reference range in every model, so +0.1 in Oklch and +10 in Lab.
  - Raw units stay available through the setters (`c.l += 0.1`).
  - Rejected: model units (the same call differs 100× between models); no methods.
- **Grill 34: `mix(b, t)` needs t, and t outside [0, 1] extrapolates** (owner). `steps(b, n)` returns n colors including both ends, and throws a RangeError when n < 2. An achromatic end takes the other end's hue (ADR-003). Rejected: a hidden default of 0.5, and clamping like CSS `color-mix()`.
- **Grill 35: the full harmony set on hue models** (owner).
  - `complement()` mutates.
  - `triadic()`, `tetradic()`, `square()` and `splitComplementary(angle = 30)` return new arrays that start with a copy of the receiver.
  - `analogous(angle = 30, count = 3)` returns an array centred on the receiver (as the chosen preview showed).
  - Rejected: arrays without the receiver; only the studio's three harmonies.
- **Grill 36: `gamutMap()` is CSS Color 4's algorithm** (`#binsearch`: OkLCh chroma reduction, deltaEOk JND 0.02, clip).
  - Lives on the RGB classes, mutating; `{ method: 'clip' }` is offered for symmetry with `clamp()`.
  - `inGamut(tolerance = 7.5e-5)` (ADR-003).
  - Accepted cost: Srgb imports the Oklch math (about +3 KB).
  - Tested against the spec's `#GM-*` examples.
  - Rejected: a separate `/gamut` import (breaks the class rule); several algorithms.
- **Grill 37: `contrast()` is WCAG 2.x, on Srgb** (ratio 1–21, symmetric). APCA waits until its license text is checked and brought to the owner (ADR-009).
- **Grill 38: color-difference metrics.**
  - On Lab: `deltaE76`, and `deltaE2000` tested against Sharma, Wu & Dalal (2005)'s 34 pairs.
  - On Oklab: `deltaEOk` and `looksSame` (< 0.02).
  - ΔE94, CMC and ITP come later with their models.
- **Grill 39: `Srgb.luminance()`** returns Y, documented as equal to `to(Xyz65).y`.
- **Grill 40: `Model.gradient(stops, n)` and `ramp(n, { from = 0.05, to = 0.95 })` both ship now** (owner chose both over deferring ramp).
  - Ramp lives on models with a lightness axis: Oklch, Lch, Lab, Oklab, Hsl.
  - The endpoint defaults are a design choice of the owner, not a sourced number.
- **Grill 41: ramp steps are raw** (owner): evenly spaced lightness, the receiver isn't forced in, nothing is gamut-mapped. Map each step for display: `ramp.map(c => c.to(Srgb).gamutMap())`.
- **Grill 42: the family base classes stay internal** (owner). Generic code uses unions of the model classes. Rejected: exporting `HueColor` / `RgbColor` / `RectangularColor` (more API to keep stable).

### Grill 43–45: contrast formula, APCA, HSL noise (decided 2026-10-19)

- **Grill 43: `contrast()` follows WCAG 2.2's literal formula** (owner).
  - It uses `0.2126 R + 0.7152 G + 0.0722 B` with the 0.04045 threshold (WCAG 2.2 `#dfn-relative-luminance`).
  - `luminance()` stays the exact Y (grill 39).
  - Measured: the exact matrix row and WCAG's 4-digit coefficients disagree on 1,951 of 33.5M pass/fail checks (every 8-bit color on white and black, at 3 / 4.5 / 7). `#006ffb` on white is 4.5001 by the exact row and 4.4999 by WCAG. Audit tools use WCAG's numbers.
- **Grill 44: APCA stays out of the MIT package** (owner).
  - Its license (apca-w3 repo HEAD) limits use to WCAG web content and prohibits commercial use without a signed agreement. It also forbids changing the constants, controls the names, and claims patents pending over "the math".
  - The npm 0.1.9 tarball's LICENSE is looser, and the "W3 cooperative agreement" it refers to is unpublished.
  - The studio's `analysis/apca.ts` is logged in the inbox for the owner.
- **Grill 45: a 1e-12 noise floor on sRGB chroma for HSL / HSV** (owner).
  - White from Lab, LCH, XYZ-D50 or Display P3 reaches sRGB with ~2e-16 of noise. HSL saturation divides by min(l, 1 − l) ≈ 1e-16, so `lab(100 0 0)` became `hsl(60 50% 100%)`.
  - Now a chroma (max − min) below 1e-12 converts as grey (s = 0, h = 0); above it, CSS's rules are unchanged.
  - Measured grey noise is ≤ 1e-15.
- Other operation findings:
  - **References:**
    - All 34 CIEDE2000 pairs (Sharma 2005) pass. Pairs 21–24 need the author's full-precision inputs from the XLS; the published inputs are 4-decimal roundings.
    - 465 WPT `color-mix()` cases and the CSS Color 4 interpolation examples pass.
    - All 29 WPT canvas gamut-mapping cases agree with colorjs.io's MINDE values to the printed 2 decimals.
  - **Deliberate differences from CSS, excluded with reasons:**
    - WPT color-mix lines 613 and 618, plus 4 more: CSS keeps an explicit hue on a grey that is already in the mixing space, while ADR-003 treats every grey's hue as missing.
    - The WAI page's `#E5E5E5` on `#6221EA` = 5.6:1, which rounds to 5.7 by WCAG's own formula.
  - **Spec:**
    - CSS Color 4 now lists three gamut-mapping algorithms that give different results; Binary Search with Local MINDE is the one ADR-005 chose.
    - The pseudo-code for `longer` yields a full 360° turn for equal hues, which its stated range [180, 360) excludes; we follow the pseudo-code.
  - **Precision:**
    - Mixing uses the weight form `v₁·a₁(1 − t)/α + v₂·a₂t/α`, algebraically CSS's premultiply-interpolate-divide, but nothing underflows and t = 0 / 1 return the ends exactly.
    - The 3×3 matrix product uses compensated summation, so sRGB white's Y is exactly 1 and black on white is exactly 21.
  - **Mutation testing:** 33 of 36 operation mutants killed. All three survivors are effectively equivalent:
    - the constructor already wraps hue
    - `minInGamut` only skips a redundant check
    - a 1.6e-10 change to CIEDE2000's G term is below the published 4 decimals

### Grill 46: wide-gamut RGB names (decided 2026-10-19)

- **Names (owner):** PascalCase of the CSS ident, so `A98Rgb` ('a98-rgb'), `ProphotoRgb` ('prophoto-rgb') and `Rec2020` ('rec2020').
- **Linear forms:** `LinearDisplayP3` ('display-p3-linear') ships because CSS has it, and `DisplayP3` now converts through it, as `Srgb` does through `LinearSrgb`. Rec2020, A98 and ProPhoto have no CSS linear form, so their linear stage stays internal.
- **Matrices** come from the generator, using the primaries in the CSS characteristics tables (csswg-drafts `40527902`):
  - A98 and Rec2020 equal CSS's rationals exactly. Rec2020's 0 entry, which CSS notes "is actually calculated as 4.99e-17" in floats, is exactly 0.
  - ProPhoto is within 4e-16 of CSS's 64-bit decimals; CSS says that matrix "cannot be expressed in rational form".
- **Transfer functions** are CSS Color 4's sample code: A98 is the power 563/256; ProPhoto is gamma 1.8 with a linear segment; Rec2020 is the BT.1886 gamma 2.4.
- **Finding:** culori 4.0.2 still decodes Rec2020 with the inverse BT.2020 OETF (α 1.0993, β 0.0181), CSS's earlier definition. Rec2020 is left out of the culori grid. For the studio migration, any Rec2020 value the app shows will change.

### Grill 47+: perceptual family (open, 2026-10-19)

Context: ADR-010 family 2 is Luv / Lchuv, Jzazbz / Jzczhz, Ictcp, Okhsl / Okhsv, Hsluv / Hpluv. A source sweep (2026-10-19) found:

- **Primary sources**:
  - Luv: CIE 015:2018 §8.2.2, eqs. 8.26–8.35. Paid; a free copy exists on law.resource.org.
  - Jzazbz: Safdar et al. 2017, Opt. Express 25(13) 15131, eqs. 8–15 and Appendix A. Open access.
  - ICtCp: ITU-R BT.2100-3 Tables 4 and 7; ΔE_ITP in BT.2124-0. Both free.
  - Okhsl / Okhsv: Ottosson's "colorpicker" and "gamutclipping" posts and `ok_color.h`. MIT.
  - HSLuv: the hsluv/hsluv Maxima files and reference code. MIT.
- **CSS Color HDR 1** (ED, 8 Oct 2026) defines `ictcp()`, `jzazbz()` and `jzczhz()`. Their channel keywords are `i ct cp`, `j a b` and `j c h`, and SDR white is `Yw = 203` cd/m², as in BT.2100-3 Table 10 note 10a and BT.2408-8 §2.1.
- **Primary reference vectors** exist only for ICtCp: BT.2124 Annex 4, 4 decimals.
  - Jzazbz and Okhsl / Okhsv have none; colour-science and colorjs test vectors are secondary.
  - HSLuv has its MIT `snapshot-rev4.json`: 4096 colours, checked to 1e-10 against its own truncated κ = 903.2962962 and ε = 0.0088564516.
  - Luv has none of its own; the HSLuv snapshot has luv columns.
- **Implementations disagree:**
  - Luv white: culori uses D50; colorjs, colour-science and HSLuv use D65.
  - Jzazbz negatives: culori clamps them; colorjs keeps the sign.
  - ICtCp: culori's `itp` stores the unscaled values under the name ITP.
- **Studio bugs found:**
  - `deltaEitp` is plain Euclidean, not BT.2124's 720·√(ΔI² + (0.5ΔCt)² + ΔCp²).
  - The HPLuv `p` range is [0, 100], but the snapshot reaches 308.
  - The Luv / LChuv ranges don't match culori's.

Decisions:

- **Grill 47, channel letters:** the CSS HDR keywords, lowercase like Lab's `l`. That gives `Jzazbz` `j a b`, `Jzczhz` `j c h` and `Ictcp` `i ct cp`. Risk: HDR 1 is still an Editor's Draft.
- **Grill 48, absolute luminance:** a fixed 203 cd/m² for relative Y = 1, applied inside the Xyz65 edge, as CSS HDR, culori and colorjs do. No absolute XYZ node and no option.
- **Grill 49, references:** cited secondary vectors where no primary exists, marked `secondary` in the fixtures, as was done for HSV: colour-science for Jzazbz, colorjs for Okhsl / Okhsv. The culori grid stays a cross-check.
- **Grill 50, Luv white:** both D65 and D50 (owner).
- **Grill 51, names:** `Luv65` / `Luv50` and `Lchuv65` / `Lchuv50`, which mirror `Xyz65` / `Xyz50`. `Hsluv` builds on `Lchuv65`.
- **Grill 52, negatives into PQ:** sign-preserving, `sign(x)·f(|x|)`, as colorjs does and as ADR-003 requires (never lose data silently). Inside the gamut it matches culori.
- **Grill 53, ICtCp variants:** both PQ and HLG (owner): `Ictcp` and `IctcpHlg`. HLG's scene-light mapping still needs sourcing.
- **Grill 54, HSLuv constants:** our exact Luv65 (κ = 24389/27) and our matrices. The snapshot is tested at a measured tolerance recorded in an ADR. HSLuv's truncated constants are not used.
- **Grill 55, HSLuv / HPLuv units:** h in degrees; s and l as 0–1 fractions, like Hsl and per ADR-004, so l = L*/100. HPLuv's p can exceed 1.
- **Grill 56, Okhsl / Okhsv:** built on our Oklab (the CSS matrices) with Ottosson's fitted coefficients unchanged. The polynomial is only the first guess, refined by his Halley step. Expect about 1e-7 against ok_color.h and culori.
- **Grill 57, ICtCp LMS matrix:** exact, from the generator: BT.2100's integers/4096 times our exact XYZ → Rec2020 rational, with the inverse also exact.
- **Grill 58, licences:** a one-line copyright + MIT header in each ported file, plus a `THIRD_PARTY_NOTICES.md` with the full texts, listed in `files`.
- **Owner, 2026-10-19:** "how to define models is your choice based on what is best and normally the practice". From here, model specifics are decided by the primary source and common practice, then logged; the owner rules on infrastructure. CLAUDE.md was updated to say so. The choices made that way:
  - **HLG input:** BT.2100-3 Table 7 applies the HLG OETF to the LMS of *scene* light. We map relative Y = 1 to the BT.2408-8 §5.1.4.1 scene-referred gain, E = Y × OETF⁻¹(0.75) = 0.264962560, so diffuse white lands at I = 0.75 as BT.2408-8 Table 1 states. Rejected:
    - CSS HDR's ÷3.7743 belongs to `rec2100-hlg`, not ICtCp, and puts white at 0.74998.
    - The inverse OOTF assumes a display.
    - colour-science's raw E = Y puts white at peak.
  - **HLG constants:** the published Note 5c literals a = 0.17883277, b = 0.28466892, c = 0.55991073, which are what CSS and colorjs use.
  - **HLG references:** primary achromatic checks from BT.2408-8 Table 1: white → [0.75, 0, 0]; 18% grey → I ≈ 0.38 and the 90% card → 0.73, each at the published 2 digits. The matrices are checked against BT.2100's integers. No chromatic primary vector exists; colour-science's are on a different input domain, so they're not used.
  - **Luv black:** X + 15Y + 3Z = 0 gives u = v = 0, as in every implementation. It is also the limit along the grey axis.
  - **Lchuv achromatic threshold:** none is published. Lch's CSS 0.0015 is borrowed, since both have L* 0–100 and chroma on a similar scale. Recorded as borrowed, not specified.
  - **Jzczhz threshold:** CSS HDR's 0.0000026.
  - **Order:** four commits, gates green before each next one: Luv / Lchuv, Hsluv / Hpluv, Okhsl / Okhsv, then the HDR group.
- **Grill 59, the Okhsl / Okhsv range (owner, 2026-10-20):** both are defined only for Oklab L in [0, 1]. Outside it, ok_color.h's gamut-shape formulas fail (colorjs and culori return garbage or NaN), and the toe has a pole at −0.03. Conversions clamp: L ≥ 1 is white, L ≤ 0 is black, in both directions, the way a byte model clamps. This deliberately bends ADR-003's no-loss rule for these two models, and the class docs say so. Rejected:
  - a RangeError, which breaks grill 32's totality;
  - passing L through with an s that no source defines.
- **Grill 60, PQ at zero (owner, 2026-10-20):** grill 52's `sign(x)·f(|x|)` is discontinuous at 0, because PQ(0) = c1^m2 ≈ 7.3e-7, and outputs inside (−7.3e-7, 7.3e-7) have no inverse. Replaced with a mirror around PQ(0): E(x) = 2·PQ(0) − PQ(−x) for x < 0. It is continuous, strictly increasing and a bijection over all reals. It is identical to BT.2100 for x ≥ 0 and never clips. The HLG √ branch is odd already (√(3E) is 0 at 0), so sign(x)·√(3|x|) stays.

### Grill 61+: appearance family (open, 2026-10-20)

Context: ADR-010 family 3 covers CIECAM02, CAM16 (and its UCS variants), HCT, and maybe CIECAM16 and ZCAM. Source sweep, 2026-10-20 (pinned: MCU bd811e4c, colour-science 248121e3, colorjs 4d3ab457, ColorAide 4eaa3e26):

- **Primary sources are paywalled:**
  - CIECAM02 is in CIE 159:2004; CIECAM16 is in CIE 248:2022.
  - CAM16 is Li et al. 2017, Color Res. Appl. 42(6).
  - Fairchild's CIECAM02 worked-example sheet now returns 404.
  - The equations are readable only as reproduced in MCU (Apache-2.0), colour-science (BSD-3) and colorjs (MIT). All three agree on M16, the 0.42 / 27.13 / 400 constants and the C formula.
- **HCT** has no paper; material-color-utilities is the definition. MCU's `Hct` stores an ARGB int and gamut-maps through `solveToInt`. ColorAide and colorjs implement an unbounded HCT with a Newton inverse.
- **Viewing conditions** are white, L_A, Y_b, surround (F, c, Nc) and a discount flag. Defaults differ:
  - MCU: L_A ≈ 11.72, Y_b ≈ 18.42, average. The studio uses these too.
  - colorjs `cam16-jmh`: 64/π·0.2 ≈ 4.07, Y_b 20.
  - colour-science: no default.
  - None of these libraries put conditions on a per-call `to()` option. ColorAide fixes them per class, the way ADR-011 put Jzazbz's 203 cd/m² inside the edge.
- **References:**
  - MCU `hct_test.ts`, 3 decimals, MCU conditions.
  - colour-science's CAM16 / CIECAM02 tests, secondary: 8 decimals for CAM16, Fairchild's 2-decimal values for CIECAM02.
  - Any examples in the papers themselves couldn't be read.
- **Pitfalls:**
  - With D < 1, D65 white isn't achromatic (MCU white: C 2.869).
  - J = 0 divides by zero in the inverse.
  - Negative cone responses and the inverse compression's pole at 400.
  - The hue-quadrature wrap below 20.14.

Decisions (owner, 2026-10-20):

- **Grill 61, viewing conditions:** fixed defaults plus a factory.
  - The owner first picked an option on `to()` and asked whether other models do this. None does: ADR-002's options hook is unused, and grill 48 fixed Jzazbz's 203 inside the edge.
  - Shown that `cam.to(Srgb)` can't carry the conditions back, the owner chose fixed conditions in the edge: Material's (L_A = 200/π · Y(L* 50)/100, Y_b = Y(L* 50), average surround, no discounting).
  - `Cam16.viewedIn({...})` returns a distinct class that knows its conditions in both directions.
- **Grill 62, HCT:** an unbounded coordinate space with a Newton inverse, as in ColorAide / colorjs. Material's sRGB-bounded behaviour is `hct.to(Srgb).gamutMap()`.
- **Grill 63, scope:** `Cam16` (channels J M h; C, Q, s, H are read-only accessors), `Cam16Ucs` plus `Cam16Lcd` / `Cam16Scd`, `Ciecam02`, `Hct`.
- **Grill 64, names:** PascalCase of the common name for the coming families, applied without asking again: `Xyy`, `Lms`, `Xyb`, `Ipt`, `HunterLab`, `Din99`, `Din99Lch`, `Lab65`, `Lch65`, `Hsi`, `Hsp`, `Tsl`, `Cubehelix`, `Aces2065`, `Acescg`, `Acescc`, `Acescct`, `Scrgb`, `SmpteC`, `Ycbcr`, `Yiq`, `Yuv`, `Ypbpr`, `Ydbdr`, `Ycgco`, `Rec601`, `Cmyk`, `Cmy`, `Ryb`.

### Grill 65+: Lab-like and tristimulus spaces (2026-10-20)

Source sweep, pinned to colour-science 248121e3, colorjs 4d3ab457 and libjxl f23e813b:

- **IPT:** the primary is free: Ebner & Fairchild 1998, CIC6 Eq. 1.
- **Paywalled or unreachable primaries:** DIN 6176, ISO/IEC 18181 (XYB), and the HunterLab notes.
- **Secondary vectors:** colour-science covers Lab D65, xyY, 1960 UCS, UVW, IPT, Hunter Lab and DIN99 / 99b / c / d, all at 8 decimals. Nobody publishes DIN99o or XYB vectors.
- **The studio's ids mislead:** `ucs` is CIE 1976 u′v′Y, `ucs60` is 1960 uvY, `uvw` is 1964 U*V*W*. The studio's `uvw` inverse treats W = 0 as black, but black is W = −17. Its `lms` comment says D65, but the matrix is HPE normalised to equal-energy white.

Decisions:

- **Grill 65 (owner):** `Uvy76` (`uvy-1976`), `Uvy60` (`uvy-1960`), `Uvw64` (`uvw-1964`).
- **Grill 66 (owner):** `Lms` is Hunt-Pointer-Estevez, equal-energy normalised (colour-science `MATRIX_XYZ_TO_HPE`), as the studio has it.
- **Grill 67 (owner):** `Din99` / `Din99Lch` (DIN 6176, checked against colour-science) and `Din99o` / `Din99oLch` (the studio's, from de.wikipedia's and culori's constants, culori grid only, flagged as having no independent reference).
- **Model specifics (by practice):**
  - xyY / u′v′ / uv at black (X + Y + Z = 0) are 0, following colour-science today and ADR-003's grey-hue-0 analogue.
  - XYB follows libjxl (B = S, opsin bias, cube root) but doesn't clamp negatives (ADR-003); the cube root keeps their sign. libjxl's invariants are its tests.
  - Hunter Lab uses colour-science's form with the 1966 Ka / Kb formula on our D65. Its table-D65 vectors are tested through the core function with that white.
  - IPT uses the paper's matrices, inverses exact from the generator. White's I ≈ 0.99999 is accepted as published.

### Grill 68+: RGB working spaces and video (2026-10-20)

Source sweep, pinned to aces-dev v1.0.3 ed0c686a / v1.3.1 fc189808, aces-docs 7c34c210, OpenColorIO 22dd9c4f, colour-science 248121e3, colorjs 4d3ab457. Free primaries found:

- **ACES:** S-2008-001 (the free predecessor of ST 2065-1) and the S-2014-003 / S-2014-004 / S-2016-001 LaTeX sources in aces-dev.
- **SMPTE 170M-2004:** free inside the ITU-R BT.1700 zip.
- **FCC 47 CFR 73.682 (2003):** free from govinfo.
- **ITU-R** BT.470-6, BT.601-7, BT.709-6, BT.2020-2 and BT.2100-3, plus **ITU-T** H.273 and T.871.
- **Paywalled:** IEC 61966-2-2 (scRGB), 61966-2-1 Amd1 (sYCC) and 61966-2-4 (xvYCC).

What the studio does today:

- ACES feeds D60 XYZ into the D65 hub with no adaptation.
- SMPTE-C is linear.
- `rec2100` maps relative Y = 1 to 10 000 cd/m².
- YIQ is culori's Kotsarenko digits.
- YDbDr and YUV use Wikipedia's rounded matrices.
- `ycocgr` is the YCgCo matrix with its channels reordered, not the lifting.
- Six ids repeat another model's math.

Decisions (owner, 2026-10-20):

- **Grill 68, YCbCr:** three classes, `Ycbcr601`, `Ycbcr709` and `Ycbcr2020`.
  - Float form: Y 0–1, Cb/Cr ±0.5 with no offset (H.273 eq. 45–47, BT.601 §2.5.2).
- **Grill 69, duplicates:** dropped and documented as a map.
  - scRGB → `LinearSrgb`, sYCC / rec601 / YPbPr → `Ycbcr601`, xvYCC → `Ycbcr709`, SECAM → `Ydbdr`.
  - YCgCo-R waits for integer-coded models.
- **Grill 70, ACES log curves:** the spec curve inside its domain, mirrored for negatives around lin 0 (as grill 60 did for PQ), with no 65504 cap. Lossless.
- **Grill 71, Rec. 2100:** `Rec2100Pq` and `Rec2100Hlg` (`rec2100-pq` / `rec2100-hlg`).
  - Both are RGB on BT.2020 primaries, with relative Y = 1 at 203 cd/m², like `Ictcp`.

Model specifics (by practice, logged):

- **ACES:**
  - White is x 0.32168, y 0.33767 (S-2008-001 §4.1.3), adapted to D65 with Bradford: ACES CTL `D60_2_D65_CAT`, OCIO `ACES.cpp:584`, color.js. colour-science defaults to CAT02.
  - The NPMs are derived exactly. The derivation reproduces S-2008-001's AP0 NPM and the published TRA1 / TRA2 to 5e-11.
- **ACEScc / ACEScct:** constants as the specs print them; ACEScct's A, B, X_BRK, Y_BRK are decimals only.
- **SMPTE-C:**
  - Primaries from SMPTE 170M §4.1.
  - Transfer from §5.1 / §5.2: OETF 1.099·L^0.45 − 0.099, linear 4.5·L below 0.018, mirrored for negatives.
  - colour-science's gamma 2.2 cites the paywalled RP 145.
- **YIQ:** SMPTE 170M Annex A eq. 6–9 (precise values, 33° rotation). Differs from culori by about 4e-4.
- **YUV:** SMPTE 170M Annex A eq. 4–5, 0.492111 / 0.877283. BT.470 prints 0.493, an arithmetic slip that 170M explains.
- **YDbDr:** derived from BT.470-6 Table 2's 1.505 / −1.902.
- **YCgCo:** H.273 eq. 51–53, channels Y Cg Co.
- **Base RGB:** the YCC models are matrices over the encoded RGB they're defined on. For 601, 709, YIQ, YUV, YDbDr and YCgCo that is `Srgb`, because sYCC defines exactly that. For 2020 it is `Rec2020`.

### Grill 72+: hue and subtractive models (2026-10-20)

Two research passes (Opus, investigation only) covered HSI, HSP, TSL, cubehelix, CMY, CMYK, RYB and RAL. Neither colour-science nor color.js has any of them; culori 4.0.2 has `hsi` and `cubehelix` only. Every source and implementation works on encoded sRGB.

Model specifics (mine, per the owner's 2026-10-19 rule):

- **HSI:** the hexagonal (HSV) hue. Wikipedia "HSL and HSV" oldid 1378989624 defines it with an inverse (§"HSI to RGB") and a table of vectors; culori and coloraide use it, so studio parity holds. Gonzalez & Woods's arccos hue differs by up to about 1°, and the book wasn't available to cite.
- **HSP:** Finley's published .299 / .587 / .114. His page's "HSP 0,1,1 → RGB 2.037,0,0" example comes from his earlier .241 weights (√(1/.241) = 2.037; .299 gives 1.8288), so it isn't a test vector. Hue in degrees (ADR-004), not Finley's turns.
  - The inverse is Finley's two branches as one formula that never divides by min/max, so s > 1 extrapolates instead of collapsing onto s = 1 (ADR-003).
  - **No independent vector exists for P.** Tests: Finley's own statement that H and S are HSV's (Wikipedia table), color-space's transcription as a cross-check, and the definitional identities.
- **Cubehelix:** d3-color's space reading of Green 2011 eq. 2.
  - Green's eq. 2 prints the blue coefficient as +1.97249; his Appendix A Fortran and every implementation use +1.97294, the only one that keeps the deviation at constant eq. 1 luma. We use 1.97294.
  - s reference range 0–4.614386868039719 (coloraide `MAX_SAT`, d3 output at blue and yellow); the studio's 4 was too small.
  - All vectors (d3 via color-space, coloraide) descend from d3's code.
- **CMY / CMYK:** CSS Color 5 §6.1 naive conversion and colour-science's `cmyk.py`, the same algebra from two sources.
  - The forward drops CSS's `min(1, …)`: (1 − c)(1 − k) is equal on [0, 1] and keeps out-of-range inks invertible (ADR-003). colour's K cap at 1 is dropped for the same reason.
  - "Or 0 if black is 1" uses the grill 45 floor (1e-12).
  - Id `cmyk`, string `device-cmyk()` with `toCss()` (CSS Color 5; browsers may not support it), parse accepts the legacy comma form of four numbers.
  - The studio's `limitInk`, rich-black and TAC heuristics are uncited; they aren't model code and stay out.

Owner grills:

- **Grill 72, TSL tint:** `t` in degrees with hue operations (recommended). `HueColor` finds the hue channel by its flag instead of a typed `h`.
- **Grill 73, RYB inverse:** Gossett's cube with an unclamped Newton inverse (recommended).
- **Grill 73b, RYB failure:** the prototype showed my "every value round-trips" was wrong: Newton from the centre solves 99.6% of an sRGB grid, the rest need a slow, non-unique search. Owner: throw a RangeError where Newton can't reach (recommended). Later found: pure blue is reachable at RYB (1, 0, 2); the failures are dark blues around rgb(0 0 0.75).
- **Grill 74, RAL:** defer, ship no RAL (recommended).

- **Grill 75, ycocgr:** the studio's matrix is plain YCoCg (`src/lib/models/modes/video.ts`), equal to `Ycgco` reordered. Options: map to `Ycgco`, a float `YcgcoR` class, or an integer-coded family. Owner: map to `Ycgco` (recommended). No integer-coded models for now.

ΔEz (mine, pattern of `deltaEItp`): Safdar 2017 eq. 15 read from the Optics Express full text. It reduces to Euclidean Jzazbz distance for Cz ≥ 0, so `Jzczhz.deltaEz` computes that. The paper has no worked example; coloraide and color.js vectors are the references.

### Grill 76: monorepo layout (decided 2026-10-20)

Roadmap step 5. ADR-007 had fixed `packages/chromatics` + changesets; open was the app's place, its library build, the task runner and CI. The root `package.json` was three things at once: the app, the workspace root, and a Svelte library build (`svelte-package`, `publint`, `exports`) under the npm name `chromatics`, which belongs to someone else, so it never shipped. CI was `deploy.yml` only; nothing ran the package's tests.

- **76a, layout:** the app moves to `apps/studio` (owner, over the recommended `apps/web`: named after the product). The root is private and only orchestrates. `docs/` stays at the root.
- **76b, app library build:** dropped; the app is private (recommended). The package is the library.
- **76c, runner:** owner asked whether Turborepo is needed and said to add it if so. It is, for 76d: `turbo run --affected` diffs against the base branch and walks the workspace graph, so a package change reruns the studio once the studio depends on it (step 6), and an app-only change skips the package suite. Path filters in the workflow can't see that graph. `turbo` 2.11.7 (2026-10-02, the newest release at least two weeks old) is a root dev dependency.
- **76d, CI:** one `ci.yml` on push and pull request running check, test and build for the affected workspaces (recommended, plus the owner's change detection). `deploy.yml` builds only the studio.

The first CI run (node 22.23, the runner's) failed two Hct tests that pass on node 24 locally. The imaginary-color round trip threw: HCT's root check wanted Y within 1e-12, tighter than float64 resolves near Y ≈ 0, and V8's Math differs in the last bits between releases. It now uses 1e-9, like chroma and hue (mine: model tolerance, ADR-012 note). The Hct totality sweep also exceeded Vitest's 5 s default on the 2-core runner; `testTimeout` is 30 s.

### Grill 77: release with changesets (decided 2026-10-20)

ADR-007 had fixed changesets + npm trusted publishing + `0.x`. The owner's `@lilbunnyrabbit/optional` repo already releases this way (Version PR via `changesets/action`, OIDC). `@lilbunnyrabbit/chromatics` doesn't exist on npm yet, and every source found says a trusted publisher can only be added to a package that exists.

- **77a, flow:** Version PR on `master` (recommended, the optional repo's pattern).
- **77b, bootstrap:** the owner publishes 0.1.0 by hand once, then adds the trusted publisher (recommended).
- **77c, when:** after step 6, the studio on the package, so the migration's API changes land first (recommended). Until then the package is `private`.
- **77d, enforcement:** no changeset check in CI; default changelog (recommended).
- **77e, owner: "no node if possible":** the changesets CLI runs on Bun (`bun --bun x changeset`, tested), but `changeset publish` always shells out to `npm publish`, and `bun publish` has no OIDC or provenance (oven-sh/bun#22423 open; #29374 closed unmerged 2026-06-26; #15601). A Bun script could do npm's token exchange (`lib/utils/oidc.js`), but without provenance. Owner: Bun everywhere, npm only for the publish step (recommended), on the runner's npm, no setup-node.
- **77f:** Node stays in `ci.yml` as the V8 test target (recommended; ADR-008, and it caught the Hct bug).

### Grill 78: the studio on the package (decided 2026-10-21)

Investigation (subagent, Opus): culori is in six studio files; the stored colour is a culori object in an immutable `ColorValue`; the DSL has 62 constructors, 196 snake_case flat keys and per-model views; saved documents store DSL source, so those names were a compatibility surface. The package lacks CVD, filters, blend, ΔE94/CMC and `clampChroma`.

- **78a, engine:** package classes everywhere (owner, over the recommended `ColorValue` wrapper). Reverses ADR-010 alternative 4.
- **78b, gaps:** into the package, each sourced, API grilled per feature (recommended).
- **78c, DSL names:** first "keep every name as an alias"; reversed in 78f/78g by the owner: "i dont like the c.oklch. or c.ok_l - i want this now to be pure based on the classes. no extra sugar" and "follow the new chromatic package. that goes for everything. we dont need backwards compatibility."
- **78d, gamut:** package css4, accept and review the diff (recommended).
- **78e, mutation:** `Object.freeze` at the store boundary (recommended).
- **78f, DSL lookup:** the instances' own members; no lookup table.
- **78g, app helpers:** none; call sites use the package directly.
- **78h, DSL syntax:** classes callable without `new` (owner, over the recommended plain `new`).
- **78i, DSL mutation:** real JS semantics (recommended).
- **78j, models:** studio = package models; stubs, RAL and aliases stay only as encyclopedia text (recommended).
- **78k, builtins:** studio design-system features stay; colour free functions go; `ensureContrast` stays a studio builtin for now (recommended).

Recorded as [ADR-016](../adrs/016-studio-on-the-package.md). Next: per-feature API grills for CVD, filters, compositing and ΔE94/CMC; then the studio baseline dump; then the switch.

### Grill 79: gap features (decided 2026-10-21)

- **79a, CVD:** `simulateCvd(srgb, 'protan' | 'deutan' | 'tritan', severity = 1)` from a `/cvd` subpath; mutates and returns its argument (recommended). The first free function, because the 297-number Machado table would otherwise ship with `Srgb` / `LinearSrgb`, which are in nearly every bundle. Applied in linear light: Machado 2009 assumes linear RGB (colorspace R 2.1-0 changed its default for this reason; culori applies it to gamma sRGB). Severity is interpolated linearly between the published 0.1 steps (mine: culori snaps to the nearest step, colour-science extrapolates from the next segment).
- **79b, CSS filters:** `srgb.filter(name, amount)` with the seven Filter Effects 1 functions, gamma sRGB (§5: "Filter Functions must operate in the sRGB color space"); mutates (recommended). One method avoids the clash with the additive `saturate()` on hue models.
- **79c, compositing:** `over(backdrop)` on Srgb and LinearSrgb, Porter-Duff source-over (CSS Compositing 1); the class is the compositing space (recommended).
- **79d, ΔE94 / CMC:** `lab.deltaE94(other, { application })`, default graphic arts (CIE 116-1995); `lab.deltaECmc(other, { l = 2, c = 1 })` (recommended). The receiver is the reference.

## Key takeaways

- The package is a typed, class-per-model, mutable, chainable API. Every operation is bound to the color's own class, and two-color operations are same-model by type.
- Conversion is an edge graph declared as static class data, so it tree-shakes with no global side effects; graph queries take an explicit model set from `/all`.
- Numeric policy: never silently lose data (raw out-of-range values, explicit clamp / gamutMap); hue wraps; grey hue is 0 with chroma-based "no hue" detection; byte models round and clamp.
- Measured, not assumed: per-color typed arrays are bigger and slower than plain fields on both V8 and JSC. Typed options on `to()` are proven to type-check.

## Still open

- Where a catalog entry's name and code live when `get()` returns a plain color.
- A packed batch type (one shared `Float64Array` for many colors): deferred until a consumer needs it.

## Action items

- [x] Investigation
- [x] Agent rules
- [x] API grill rounds 1–14
- [x] ADRs for the decided rounds: [ADR-001…010](../adrs/README.md)
- [ ] Owner review of PRINCIPLES / CONVENTIONS / CLAUDE.md rule sections
- [x] `@lilbunnyrabbit/optional` 1.1.0 published 2026-10-19 via npm trusted publishing (OIDC); the package depends on `^1.1.0`
- [x] Source the open numbers (grill 16)

## Next session topics

- Review the ADRs
- Sourced constants
- Scaffold `packages/chromatics` and the core models
