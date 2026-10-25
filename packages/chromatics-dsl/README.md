# @lilbunnyrabbit/chromatics-dsl

The Chromatics color language: small programs that derive colors from colors, evaluated headless. You declare your own roles; a program binds them in light and dark mode; you read the result as data, audit it and export it. The language runs on [`@lilbunnyrabbit/chromatics`](../chromatics/README.md): its classes are the language's colors.

Pre-release (`0.0.0`): the API is still being decided ([ADR-018](../../docs/adrs/018-dsl-package.md)).

## Install

```sh
npm install @lilbunnyrabbit/chromatics @lilbunnyrabbit/chromatics-dsl
```

`@lilbunnyrabbit/chromatics` is a peer dependency, so your app and the language share one `Color` class.

## Quick start: a 17-token theme

```ts
import { deriveScheme } from "@lilbunnyrabbit/chromatics-dsl/scheme";
import { toCssVars } from "@lilbunnyrabbit/chromatics-dsl/export";

const TOKENS = [
  "background",
  "background_lightest",
  "background_lighter",
  "background_light",
  "background_dark",
  "background_darker",
  "background_darkest",
  "foreground",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "cottontail",
  "success",
  "warning",
  "error",
  "info",
] as const;

const source = `
seed = Oklch(0.255, 0.0233, 230.47)
background = seed
background_dark = seed.clone().shift({ l: -0.04 })
background_light = seed.clone().shift({ l: 0.04 })
foreground = Oklch(0.95, 0.008, 50)
primary = ensureContrast(Oklch(0.72, 0.14, 230), background, "AA")

roles {
  dark {
    background = background_dark
  }
}
`;

const theme = deriveScheme(source, {
  roles: TOKENS,
  pairs: [{ label: "Text", fg: "foreground", bg: "background" }],
});

theme.errors; // [] — or { message, line, span } per problem, e.g. an unknown role key
theme.modes.dark.background; // a frozen Color
theme.audit.dark; // [{ label: "Text", fg: "foreground", bg: "background", ratio }], WCAG 2
toCssVars(theme.modes.dark, { mode: "single", model: "Oklch" });
// :root {
//   --background: oklch(0.215 0.0233 230.47);
//   --background-light: oklch(0.295 0.0233 230.47);
//   --background-dark: oklch(0.215 0.0233 230.47);
//   --foreground: oklch(0.95 0.008 50);
//   --primary: oklch(0.72 0.14 230);
// }
// The 12 tokens the program doesn't define stay unbound and aren't written.
```

Roles the program doesn't mention bind to the color variable with the same name. Pass `auto` to guess them some other way.

## API

- **`.`** — `evaluate(source)` → `{ variables, errors, order }`. Never throws. A `Variable` is `{ name, value, deps, line, span }`, with `span` the right-hand side's `{ start, end }` offsets in `source`; an `EvalError` is `{ message, line, span? }`. Colors in the result are frozen: `clone()` or `to(Model)` before changing one. Also `createEnvironment()` (the builtins, read-only use), `MODEL_CLASSES`, `modelName`, `isColor`, `isModel`, `isPreview`.
- **`./scheme`** — `deriveScheme(source, { roles, pairs, auto? })` → the evaluation plus `modes.light` / `modes.dark` (`role → Color`, frozen) and `audit.light` / `audit.dark`. `audit(colors, pairs)` measures pairs on any role → color record. `schemeFromEvalResult` splits colors from the rest; tokens (`tokensFromScheme`, `buildTokenVars`, `DEFAULT_TOKENS`) and component specs (`componentsFromScheme`) read the `tokens` / `component` namespaces.
- **`./export`** — `toCssVars(mode, format?)` writes exactly the declared roles that have a color; `toPaletteVars(scheme, format?)` writes every color variable; `toTokens` (DTCG), `toTailwind`, `toMarkdown`, `toSwatchSVG`, `serializeColor`, `kebab`.

## The language

A program is assignments, one per line, in a subset of JavaScript: numbers, strings, arrays, objects, `?:`, `&&`, `||`, arithmetic and comparisons. No loops, no functions, no `new` except on a model class (and model classes are callable without it).

- **Builtins** (the same in every host): every model class of the color package by export name (`Oklch`, `Srgb`, `Hct`, …), `parse(css)`, `ensureContrast(fg, bg, "AA" | "AAA" | "AA-large" | "AAA-large" | ratio)`, `simulateCvd(srgb, "protan" | "deutan" | "tritan", severity?)`, `abs min max round floor ceil clamp`.
- **Methods** are the package's own, with JS semantics: they mutate their receiver, so `brand.clone().shift({ l: 0.1 })` keeps `brand`.
- **Namespaces and blocks:** `preview.*` returns descriptors for a host to render; `tokens.*` and `component.*` build design tokens and component specs; `preview {}`, `tokens {}` and `component {}` call their members bare. `roles { role = colorName }` (with nested `light {}` / `dark {}`), top-level `light {}` / `dark {}`, and `theme({ role: "name" })` / `theme.dark({…})` bind roles.

## Tests

Vitest on node and bun (`bun run test`), as the color package (ADR-008).
