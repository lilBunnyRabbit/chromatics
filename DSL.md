# Chromatics — Color DSL Design Document

## Overview

A DSL-based color design tool where users define color variables, relationships, and transformations using JS-like code. The system evaluates these lines, tracks variable dependencies, and renders a live preview with an inspector sidebar.

```
background = OKLCH(0.255, 0.0233, 230.47)
foreground = OKLCH(1 - background.l, background.c / 3, (background.h + 180) % 360)
primary = OKLCH(foreground.l, background.c * 3, (foreground.h + 360 / 5) % 360)
secondary = primary.complement()
success = OKLCH(primary.l, primary.c * 2, 140)
```

### Why

- Captures **relationships** between colors (missing in existing tools)
- Allows **dynamic theme building** (change one hue and everything updates)
- Provides **reproducible scripts** for themes
- Works for developers (code) and designers (UI + color picker)
- Integrates with the chromatics color model system

### Inspiration

- **Strudel REPL** — music language exposing a light JS-like environment in the browser
- **color-testing** scheme files — `brand-dark.ts` already encodes the exact patterns this DSL formalizes, but with TypeScript boilerplate (name strings, description strings duplicating the formula, constructor noise)

---

## Implementation Approach: Parse as JS, Evaluate as Controlled Interpreter

Use `acorn` (~40KB, zero deps, ESTree AST) to parse user code as JavaScript. **Do not execute it as JavaScript.** Walk the AST with a custom evaluator. This gives us:

1. **JS-familiar syntax** — zero learning curve
2. **Full control** — we decide what's allowed (no loops, no `fetch`, no DOM)
3. **Dependency tracking** — during evaluation, record which variables each assignment reads
4. **Source mapping** — every value traces back to an AST node with exact line/column
5. **Two-way editing** — change a color in the UI, find the AST node, modify the source text
6. **Reactive re-evaluation** — change `background` and topologically re-evaluate everything downstream
7. **Rich error messages** — "Line 3: `bg.saturation` — did you mean `bg.s`?"

### Why not a custom DSL parser?

We'd need to define and maintain a grammar, build a parser, handle operator precedence, build an AST walker, implement scoping rules... all to arrive at a language that's a strict subset of JavaScript anyway. Every feature request ("can I use ternaries?") means extending the grammar.

### Why not raw JS evaluation (`with(env)` + `new Function()`)?

Works but gives almost no introspection. Can't track dependencies, can't map a UI color pick back to a source line, can't show "foreground depends on background" in the sidebar.

### Allowed constructs

The custom evaluator allows:

- **Variable assignment** — `x = ...`
- **Arithmetic** — `+`, `-`, `*`, `/`, `%`
- **Property access** — `bg.h`, `fg.l`
- **Method calls** — `bg.invert()`, `mix(a, b, 0.5)`
- **Constructor calls** — `HSL(...)`, `OKLCH(...)`, `RGB(...)`
- **Parenthesized grouping**
- **Comparison/ternary** — useful for `isDark ? X : Y`

Rejected at the AST level:

- Loops (`while`, `for`)
- `import`, `require`, `eval`
- Object/array literals (unless needed later)
- `this`, `new` (constructors are just function calls in our world)
- Any identifier not in the environment

### Evaluator sketch

```typescript
function evaluate(node: ESTree.Node, scope: Scope): Value {
  switch (node.type) {
    case 'Literal': return node.value;
    case 'Identifier': return scope.get(node.name);
    case 'BinaryExpression':
      return applyOp(node.operator, evaluate(node.left, scope), evaluate(node.right, scope));
    case 'MemberExpression':
      return evaluate(node.object, scope).get(node.property.name);
    case 'CallExpression':
      const fn = evaluate(node.callee, scope);
      const args = node.arguments.map(a => evaluate(a, scope));
      return fn.apply(args);
    case 'AssignmentExpression':
      const value = evaluate(node.right, scope);
      scope.set(node.left.name, value, node); // store AST ref for source mapping
      return value;
  }
}
```

---

## Color Object Model

A unified `Color` class wrapping Culori. Stores in OKLCH internally (perceptually uniform). Constructed via any color space, but all return the same type.

### Channel accessors (on-demand conversion)

```
color.h / color.s / color.l          — HSL channels
color.ok_l / color.ok_c / color.ok_h — OKLCH channels
color.r / color.g / color.b          — sRGB channels (0-1)
color.hex                            — hex string
```

### Operations (all return new Color)

```
color.lighten(amount)       color.darken(amount)
color.saturate(amount)      color.desaturate(amount)
color.invert()              color.complement()
color.rotate(degrees)       color.mix(other, ratio)
color.shift({ l, c, h })   color.derive({ l, c, h })
```

### Utility

```
color.contrast(other)  — WCAG contrast ratio (number)
color.wcag(other)      — { normal: 'AA'|'AAA'|'Fail', large: ... }
color.inGamut          — boolean (sRGB)
color.inP3             — boolean (Display P3)
color.gamutMapped      — new Color clamped to sRGB
```

### Design decisions

- **Single type** — `HSL(300, 0.4, 0.5)` and `OKLCH(0.5, 0.1, 300)` return the same `Color` type. The constructor name determines how inputs are interpreted, not the runtime type.
- **Immutable** — every operation returns a new Color. This makes dependency tracking reliable.
- **Culori underneath** — handles gamut mapping, conversions, perceptual operations. The chromatics registry pattern wraps it for lazy on-demand conversion with caching.
- **No `$` prefix** — `bg` is cleaner than `$bg`. The DSL context makes it unambiguous.
- **Strict types** — `HSL(300, 0.4, 0.5)` is a color, `300` is a number, `bg.h + 180` is a number. No implicit coercion.

---

## Dependency Graph & Reactive Re-evaluation

Every assignment creates edges in a DAG:

```
background = OKLCH(0.255, 0.0233, 230.47)                        // no deps
foreground = OKLCH(1 - background.l, ...)                         // depends on: background
primary = OKLCH(foreground.l, background.c * 3, ...)              // depends on: foreground, background
secondary = primary.complement()                                  // depends on: primary

    background ──→ foreground ──→ primary ──→ secondary
         └────────────────────────↑
```

### How it works

During evaluation, the scope tracks reads:

```typescript
scope.get(name) {
  this.currentDependencies.add(name);  // track what's being read
  return this.variables.get(name);
}
```

After each assignment completes, `currentDependencies` contains the exact set of variables that line depends on.

### Re-evaluation on change

When the user changes `background` (via code edit or color picker):

1. Mark `background` as dirty
2. Topological sort dependents: `foreground` → `primary` → `secondary`
3. Re-evaluate in that order
4. Update UI for all changed variables

### Line-by-line evaluation

Each line is an assignment. No multi-line constructs (no `if/else`, no blocks). Every line maps to exactly one variable. For conditional logic, use ternaries: `theme = isDark ? OKLCH(0.2, ...) : OKLCH(0.9, ...)`.

---

## Two-Way Editing

When the user clicks a color swatch and picks a new color via UI:

1. **Look up the variable** — we know which variable name was clicked
2. **Find the assignment AST node** — stored in the scope during evaluation
3. **Determine what to change**

### The hard part

For simple cases like `bg = OKLCH(0.255, 0.0233, 230.47)`, replace the literal arguments. But what about `fg = OKLCH(1 - bg.l, bg.c / 3, (bg.h + 180) % 360)`?

Three options:

- **Option A: Break the relationship** — replace the whole expression with a literal. Fast, simple, but loses the dependency. Show a warning: "This will break the link to `bg`."
- **Option B: Inverse computation** — if `fg` depends on `bg`, and the user changes `fg`, solve backwards for what `bg` would need to be. Complex, skip for MVP.
- **Option C: Allow both modes** — clicking the swatch shows a picker AND the formula. The user can either adjust parameters or break the link.

**MVP: Option A** with clear UI indicators showing which variables are "computed" (have formulas) vs "literal" (just a value). **Long-term: Option C.**

---

## Webapp Architecture

### Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | SvelteKit | Existing stack, Svelte 5 runes are perfect for reactive state |
| Editor | CodeMirror 6 | Lightweight (~150KB), extensible, custom language support via Lezer |
| Color math | Culori | Proven in color-testing, handles all conversions and gamut mapping |
| Color models | chromatics | The core library, extended with the unified Color class |
| Build | Vite + Bun | Existing stack |
| Deploy | Static | GitHub Pages or Vercel |

CodeMirror 6 over Monaco — Monaco is VS Code's editor (~3MB), harder to customize, overkill for a single-language editor. CodeMirror 6 is modular and has first-class support for custom languages via `@lezer/lr`. Enables:

- Syntax highlighting (color constructors, numbers, operators, variables)
- Inline color swatches (like VS Code's color decorators)
- Autocomplete (variable names, methods, constructors)
- Error underlining from the evaluator

### UI layout

```
┌──────────────────────────────────────────────────────┐
│  Toolbar: [Export v] [Theme v] [Share]                │
├───────────────────┬──────────────────────────────────┤
│                   │                                  │
│   Code Editor     │   Variable Inspector             │
│                   │                                  │
│   bg = OKLCH(...) │   [████] bg      #17252c        │
│   fg = bg.inv...  │          oklch(0.26, 0.02, 230)  │
│   primary = ...   │          depends on: (root)      │
│                   │                                  │
│                   │   [░░░░] fg      #b1aba8        │
│                   │          oklch(0.75, 0.01, 50)   │
│                   │          depends on: bg           │
│                   │                                  │
│                   │   click swatch to pick            │
│                   │                                  │
├───────────────────┴──────────────────────────────────┤
│                                                      │
│   Preview Pane (configurable templates)              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│   │ Card     │ │ Button   │ │ Text     │            │
│   │ using bg │ │ primary  │ │ on bg    │            │
│   └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### State flow

```
                    ┌─────────────┐
                    │ Source Text  │  <-- single source of truth
                    └──────┬──────┘
                           │ parse (acorn)
                           v
                    ┌─────────────┐
                    │     AST     │
                    └──────┬──────┘
                           │ evaluate (custom walker)
                           v
                ┌──────────────────────┐
                │ Scope                │
                │  variables: Map<     │
                │    name -> {         │
                │      value: Color,   │
                │      node: ASTNode,  │
                │      deps: string[], │
                │      line: number    │
                │    }                 │
                │  >                   │
                │  depGraph: DAG       │
                └──────────┬───────────┘
                           │
              ┌────────────┼────────────┐
              v            v            v
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Editor  │ │Inspector │ │ Preview  │
        │(CodeMirr)│ │(swatches)│ │(template)│
        └──────────┘ └──────────┘ └──────────┘
              │            │
              │ text edit  │ color pick
              └─────┬──────┘
                    v
              Update source text -> re-parse -> re-evaluate
```

**Principle: text is the source of truth.** Everything derives from it. Two-way editing means "find the right place in the text, modify it, let the normal parse/evaluate/render pipeline handle the rest."

---

## MVP Roadmap

### Phase 1: The evaluator (pure TypeScript, no UI)

- Parse with acorn
- Custom AST walker: literals, identifiers, binary ops, member access, function calls, assignment
- Scope with variable storage and dependency tracking
- Color class wrapping Culori with channel accessors and methods
- Constructor functions: `HSL()`, `RGB()`, `OKLCH()`, `hex()`
- Test by rewriting `brand-dark.ts` relationships as DSL

### Phase 2: Basic webapp

- Textarea (not CodeMirror yet) for input
- Evaluate on every keystroke (debounced)
- Show variables with color swatches
- Show errors with line numbers
- Pre-load an example script

### Phase 3: Make it good

- CodeMirror 6 with syntax highlighting
- Inline color swatches in the editor
- Variable inspector with dependency visualization
- Color picker on swatch click (literal values only at first)
- Preview pane with configurable templates

### Phase 4: Power features

- Two-way editing with formula awareness
- Export to CSS variables / JSON tokens / Tailwind config
- Share via URL (encode script in URL hash)
- Import from existing CSS variables
- Contrast/WCAG checking (from color-testing)
- Vision simulation (from color-testing)

---

## DSL Examples

### Basic theme

```
bg = OKLCH(0.255, 0.0233, 230.47)
fg = OKLCH(1 - bg.l, bg.c / 3, (bg.h + 180) % 360)
primary = OKLCH(fg.l, bg.c * 3, (fg.h + 360 / 5) % 360)
secondary = primary.complement()
accent = OKLCH(primary.l, primary.c, fg.h)
```

### Semantic colors

```
success = OKLCH(primary.l, primary.c * 2, 140)
warning = OKLCH(primary.l, primary.c * 2, 70)
error = OKLCH(primary.l, primary.c * 2, 30)
info = OKLCH(primary.l, primary.c * 2, 240)
```

### Background scale

```
bg_light = bg.lighten(0.1)
bg_lighter = bg.lighten(0.2)
bg_dark = bg.darken(0.1)
bg_darker = bg.darken(0.2)
```

### Mixing

```
overlay = bg.mix(primary, 0.1)
muted = fg.desaturate(0.3).lighten(0.1)
```

### Conditional

```
surface = bg.l < 0.5 ? bg.lighten(0.05) : bg.darken(0.05)
```
