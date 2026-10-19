# Conventions

How code is written in this repo. Derived from the code as it is. When this file and the code disagree, the code wins and this file gets fixed, unless the code is listed under _Known drift_.

For _why_, read [PRINCIPLES.md](PRINCIPLES.md). The app's architecture map lives in [CLAUDE.md](../CLAUDE.md).

---

## Where code goes

Today, single package:

```
src/lib/
├── models/      # color engine (culori wrapper, to be replaced by our package)
├── analysis/    # contrast, APCA, CVD, ΔE, quantize, combinations
├── dsl/         # the color language: evaluator, manifest, editor bindings
├── scheme/      # EvalResult → Scheme, roles, tokens, derive spine
├── export/      # CSS / DTCG / Tailwind / swatch / styleguide
├── state/       # runes singletons (*.svelte.ts)
└── components/  # Svelte UI
src/routes/      # routes + examples only
tests/           # bun:test, *.test.ts; acceptance/ + fixtures/
```

The package lives in `packages/chromatics/` (ADR-007):

```
packages/chromatics/
├── src/
│   ├── index.ts        # root barrel
│   ├── all.ts          # models[], parse, reachable, path
│   ├── core/           # color.ts, edge.ts, router.ts, families/
│   └── models/{id}/    # {id}.ts, {id}.test.ts, {id}.domain.ts, {id}.fixtures.json, README.md
└── scripts/fixtures/   # oracle generators (uv + Python where needed)
```

A folder per model, flat: a model's family lives in its base class, not its path. Package tests sit beside their source; the studio's tests stay in `tests/`.

### Three layers of logic

| File | Contains | Svelte? |
|---|---|---|
| `*.ts` | Pure functions, math, parsing | No |
| `*.svelte.ts` | Reactive state | Runes only |
| `*.svelte` | Rendering, wiring events | Yes |

The package is pure `.ts`: no Svelte, no DOM, no runtime dependency on the app.

---

## Naming

| Thing | Style | Example |
|---|---|---|
| Variables, functions, methods, properties | `camelCase` | `ensureContrast`, `rotateHueInMode`, `isDisplayable` |
| Types, interfaces, classes | `PascalCase` | `ColorValue`, `ModelView` |
| Svelte components | `PascalCase.svelte` | `DesktopShell.svelte` |
| `.ts` files and folders | `kebab-case` | `custom-modes.ts`, `brand-dark.test.ts` |
| Module-level constants | `SCREAMING_SNAKE` | `INTERP_SPACES`, `SAVE_DEBOUNCE_MS` |

**No snake_case identifiers** (owner, 2026-10-18). Native and library APIs stay as they are.

Package color models (2026-10-18 grill): classes are PascalCase words (`Oklch`, `Srgb`, `DisplayP3`, `Xyz65`, `Ycbcr`, `Xyy`). **Channels are the spec's letters, case-sensitive** (`l c h`, `x y Y`, `J C h Q M s`). That's the one deliberate exception to camelCase: they're math symbols, so formulas read 1:1.

### Types

- `interface` for object shapes; `type` for unions, intersections, mapped types.
- Discriminated unions over optional-field soup.
- No `any`. `unknown` + narrowing.
- TypeScript over its JS-era equivalent: `private` / `protected` / `readonly`, never `#private` fields.
- **JSDoc is for IntelliSense** (owner, 2026-10-19): every exported symbol of the package gets a `/** */` block (never `//`) that highlights what a developer needs at the call site, without restating the signature:
  - units and ranges of every number (`l` 0–1, `h` degrees, wraps into [0, 360))
  - whether the call **mutates** the receiver or returns new instances
  - what it throws, and defaults
  - the formula's source (`@see` spec section or paper)
  - a short `@example` where usage isn't obvious

---

## Svelte 5 (app only)

- Runes only. No `export let`, no `$:`, no stores.
- Props: `interface Props` + `let { … }: Props = $props()`.
- `$derived` for anything computable; `$effect` only for real side effects, returning its cleanup.
- Theme / viewport detection after mount only (see CLAUDE.md gotchas).

---

## Formatting

- Studio: tabs, single quotes, no trailing commas, 100 cols (root `.prettierrc`). `bun run format`.
- Package: the owner's config: 2 spaces, double quotes, es5 trailing commas, 120 cols (`packages/chromatics/.prettierrc`). Run `bunx prettier --write packages/chromatics` from the root. Fixture JSON is machine-written and ignored.

## Tests

`bun test` (bun:test). Today in `tests/`, named after the module (`conversions.test.ts`). Acceptance tests in `tests/acceptance/`, shared oracles in `tests/fixtures/`.

- Test behaviour through the public API.
- A test must fail when the behaviour breaks: break the code once on purpose and check.
- Expected values carry their source. See CLAUDE.md, _Numbers need sources_.
- Package (ADR-008): every model's `<model>.test.ts` calls `describeModel(Model, models, spec)` from `src/testing/harness.ts`. That runs the whole matrix:
  - shape and boundaries
  - degenerate input
  - totality
  - every edge both ways (grid plus fast-check)
  - parse / format
  - references from `<model>.fixtures.json`
  - the culori cross-check

  Model-specific cases go in a `describe` beside it. Each one cites its source.
- The harness has its own test (`harness.test.ts`) with deliberately broken models. A new harness row needs a broken model that fails it.
- How the harness compares a model's colors (hue weight, channels that don't matter, wide round trips) lives in `src/testing/specs.ts`.
- Fixture provenance and exclusions: `packages/chromatics/scripts/fixtures/README.md`. Regenerate the culori grid with `bun run fixtures:culori`.

## Comments

Only for a non-obvious _why_: a constraint, an edge case, a spec quirk. A formula gets a citation comment (spec section, paper, equation number). Public API docs go in JSDoc. `TODO:` only for known gaps.

## Dependencies

Ask before adding one, runtime or dev. The package's dependency policy is an ADR.

---

## Known drift

Listed so nobody "fixes" it as a drive-by. Renames go in their own `refactor:` commit, after the owner says so.

- `src/lib/state/docs.svelte.ts` uses `#private` fields (`#queueSave`, `#persistActive`, …).
- The DSL's namespaced channel keys are snake_case (`ok_l`, `ok_c`, `ok_h`, `lab_a`). They're public DSL surface, so renaming them is an API decision, not a cleanup.
- `CLAUDE.md` says `registry.ts` is the only culori importer. It isn't: also `types.ts`, `custom-modes.ts`, `modes/shared.ts`, `dsl/swatch-deco.ts`, legacy `dsl/color.ts`.
