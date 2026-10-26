# ADR-018: The DSL as its own package

**Date:** 2026-10-26
**Status:** Implemented

> **Revision 2026-10-26: implemented** (branch `feat/chromatics-dsl`). Choices made while implementing; the owner signed them off after the build (grill 82u) with the two changes marked below:
>
> - **Layout:** `src/{evaluator,environment,values,preview,contrast-target,kebab}.ts`, `src/namespaces/{tokens,components,theme}.ts`, `src/scheme/` (`derive`, `audit`, `adapter`, `theme-config`, `tokens`, `components`, `types`), `src/export/` (`index`, `swatch`). Exports: `.` (evaluate, types, `createEnvironment`, `MODEL_CLASSES`, `modelName`, `isColor`, `isModel`, `isPreview`; previews live here, they are the language's values), `./scheme`, `./export`.
> - **Result:** `DerivedScheme<R> extends EvalResult` adds `modes: { light, dark }` (`ModeColors<R>`, a frozen partial `Record<R, Color>`: unbound roles are absent) and `audit: { light, dark }` (`AuditRow[]`). Generic over the host's role union, so `roles: TOKENS as const` types `modes.dark.background_dark`.
> - **Pairs:** `AuditPair { label, fg, bg, alpha?, large? }` in, `AuditRow` (`+ ratio`) out; a pair with an unbound role is left out. `audit(colors, pairs)` is exported so a host can measure its own bindings (the studio does, with its overrides and fallbacks). Alpha composites in linear sRGB, as the studio did.
> - **Binding:** light = declared line → `auto` (when given; replaces the same-name rule) → same-name variable → unbound; dark = light re-pointed by declared dark lines. **Changed at sign-off (82u):** a `roles {}` / `light {}` / `dark {}` / `theme()` line naming a color that doesn't exist is an error, `Unknown colour 'bgg' for role 'background'`, with the line and the name's span (the variable's for `theme({…})`), and it doesn't fall through: the role is unbound in that mode (dark doesn't inherit light for it). The studio shows the error and keeps its own display fallback (dangling dark → light value plus its mode warning), since its bindings are its own.
> - **Role validation:** `evaluate` keeps its no-options signature and keeps every key as written (`ThemeConfig.roles` is now raw); `deriveScheme` checks each `roles {}` / `light {}` / `dark {}` / `theme()` key against `roles` and appends `Unknown role 'x'. Declared roles: …` errors after the evaluation errors, with the key's own line and span for blocks and the variable's for `theme({…})`. Positions ride a module-private `WeakMap`, so the descriptor's shape doesn't change. Non-string targets in `theme({…})` still drop silently.
> - **Exporters:** `toCssVars(mode, format?)` writes the roles with a color in declared order, kebab-named; the palette exporter is `toPaletteVars(scheme, format?)` (the old `toCssVars`). `serializeColor` takes a `Color` (was a scheme entry). `ColorFormat.model` resolves through `MODEL_CLASSES`, so the package needs no labels; `CSS_COLOR_MODELS`, `EXPORT_FORMATS` and `exportScheme` stay in the studio. `kebab` lives in its own module and is exported from `./export`.
> - **Spans:** `Variable.span` is the right-hand side; a `roles` / `light` / `dark` variable spans its (last) block. `EvalError.span` is the failing statement, or the parse error's position (`start === end`). The evaluator types its AST with acorn's own `Node`; `@types/estree` left the studio.
> - **Unknown models:** `modelName` falls back to the model's `id` instead of throwing.
> - **Stays in the studio:** the 12 roles and their spellings (`KEY_ALIASES` folds `background`, `primary_fg`, `primary-fg` onto `bg`, `primaryFg`; the studio declares all 22 spellings, so Brand Dark's `background = …` still binds), `autoAssign`, the 21 pairs, overrides, the role fallback chain, `cssVars`, `groupLabel`, mode warnings, `render/resolve` and the component audit (both name studio roles and CSS vars), the styleguide exporter, the editor docs for the namespaces (`dsl/builtin-docs.ts`, checked against `createEnvironment()` by `tests/manifest.test.ts`).
> - **`ensureContrast`:** lightness steps of 0.005 and chroma at 100 / 75 / 50 / 25 / 0 % (today's search). Already-passing colors are only gamut-mapped. Alpha is kept (the studio's helper returned alpha 1 on a moved color). `RangeError` outside [1, 21] or on `NaN`; the DSL builtin keeps its string targets and their `Error`.
> - **Peer range (82u):** every color-package minor ships with a DSL changeset that widens the peer range by hand (`^0.2.0 || ^0.3.0`) as a patch; the changesets config stays as is. `src/peer-range.test.ts` fails when `peerDependencies["@lilbunnyrabbit/chromatics"]` doesn't include the color package version the next release publishes (the workspace version with pending color-package changesets applied, so it holds before and after the Version PR). It hand-parses caret ranges joined by `||`; any other syntax fails. The package's `turbo.json` adds `.changeset/*.md` and the color package's `package.json` to the test inputs.
> - **Release:** `"private": true`, version 0.0.0, initial minor changeset waiting (changesets skips private packages and keeps their changesets). Until the color package's Version PR lands, `changeset` prints "must depend on the current version … 0.1.0 vs ^0.2.0" (non-fatal). Once on the peer graph, a color-package minor past `^0.2.0` makes changesets bump this package's major.
> - `NONE_ROLE` is written `'\u0000'` (same value), so git no longer treats `roles.ts` as binary.

## Context

ADR-001 made the DSL an adapter inside the studio. The owner wants to run Chromatics programs in WebOS (2026-10-25), whose themes are one-mode records of 17 snake_case tokens. The studio's DSL, design system and exporters have no Svelte or app imports apart from `dsl/editor-bindings.ts`, so they can move. What blocks a host other than the studio: the design-system vocabulary is a fixed set of 12 web-UI roles, and `rolesConfig` silently drops any other key; results mix data with studio CSS strings; `Variable` exposes the estree AST; the catalog and manifest throw on a colour model they don't know; `isColor` uses `instanceof Color`. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grill 82.

## Decision

- **Package:** `@lilbunnyrabbit/chromatics-dsl` in `packages/chromatics-dsl`, ESM, per-file `tsc` like the colour package. Dependencies: `acorn`. Peer: `@lilbunnyrabbit/chromatics` `^0.2.0`, so host and DSL share one `Color` class. Own 0.x version, released through the same changesets flow; first publish by hand, then a trusted publisher (ADR-007 runbook).
- **Scope (headless):** the language core (`evaluate`), the design system (`deriveScheme`, tokens, components, roles, modes, audit), previews as descriptors, and the exporters. CodeMirror tooling, the docs JSON, the migrator (ADR-017), the guided flow, diff and the encyclopedia stay in the studio.
- **Fixed environment:** every host gets the same builtins (model classes by export name, `parse`, `ensureContrast`, `simulateCvd`, math, the `preview` / `tokens` / `component` / `theme` namespaces). No host-injected builtins.
- **Host-declared roles:** `deriveScheme(source, { roles, pairs, auto? })`. `roles` is the host's role list, `pairs` its audit pairs, `auto` an optional guesser for roles a program leaves unbound. Without `auto`, a role binds to the variable of the same name. `roles {}` and `dark {}` accept declared keys only; an unknown key is an evaluation error. The package knows no role names: the studio's 12 roles, its audit pairs and `autoAssign` stay in the studio.
- **Two modes:** light and dark, from today's blocks.
- **Data-first result:** `deriveScheme` returns variables, errors, `modes.light` / `modes.dark` as `Record<role, Color>` (frozen), and an audit per mode. CSS lives in `export/`: `toCssVars(mode)` emits exactly the declared roles; a palette exporter emits every colour variable.
- **Public types:** `Variable { name, value, deps, line, span }` and `EvalError { message, line, span? }`, where `span` is `{ start, end }` source offsets. No estree types in the public `.d.ts`. `evaluate` never throws.
- **Unknown colour models** work in programs with no docs label; nothing throws. The studio's own test still requires a label for every model.
- **`ensureContrast` moves to the colour package** as `Srgb.ensureContrast(bg: Srgb, ratio: number, opts?: { keepChroma?: boolean }): this`. It mutates and returns `this`, always in gamut. It keeps hue in OKLCH and searches lightness, then (unless `keepChroma`) chroma, for the colour nearest the original that meets `ratio`. When `ratio` can't be reached, the result is the better of black and white: best effort, documented, a deliberate exception to ADR-003 so a live program never errors while a seed is dragged. The DSL builtin `ensureContrast(fg, bg, target?)` keeps its string targets and returns OKLCH. APCA stays in the studio (licence, grill 44).
- **Tests:** Vitest on node and bun (ADR-008). Tests pinned to studio examples (Brand Dark golden hexes, the culori baseline, the migrator) stay in the studio.
- **Delivery:** one PR with the colour package's `ensureContrast` (0.2.0), the new package and the studio switch.

## Alternatives Considered

1. A `/dsl` subpath of the colour package (one version, but acorn as a runtime dependency and studio concepts under the core library's name); keeping the DSL in the app.
2. Language core only; everything including the CodeMirror tooling and the migrator.
3. The colour package as a regular dependency; a peer plus a brand symbol instead of `instanceof`.
4. A fixed 12-role vocabulary mapped by the host; variables only, no roles.
5. A web role preset exported by the DSL package.
6. `ensureContrast` in the DSL package; as an `Oklch` method; as a free function in a `/contrast` subpath. Throwing, or a strict flag, when the target is unreachable. No options; `step` kept.
7. Today's 22-field `RenderedScheme` as the public result. N named modes. Host-injected builtins.
8. Lockstep versions; error codes; two PRs.

## Consequences

- ADR-001's "the DSL is an adapter in the app" no longer holds for the headless layers; the colour package still doesn't bend for the DSL, except for `ensureContrast`, which earns its place as a colour operation.
- The roles, theme and modes code is redesigned around a host role list; the studio becomes one host among others.
- WebOS can build a theme from a program: declare its 17 tokens, evaluate, read `modes.dark`, export with `toCssVars`.
- Two npm packages to release and keep compatible within the peer range.
