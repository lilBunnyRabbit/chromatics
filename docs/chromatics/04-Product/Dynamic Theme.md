---
tags: [product, dynamic-theme]
status: spec
updated: 2026-06-24
---

# Dynamic Theme

**Generate a complete, accessible UI theme from one or a few base colors -- with brand-locked constraints, semantic roles, enforced contrast, and a framework-agnostic CSS-variable core plus thin per-framework adapters.**

---

## The Concept

Most theming tools today expect you to hand them a *finished* theme: a full object of color tokens, already balanced, already accessible. The work of going from "here is my brand blue" to "here are forty harmonious, legible tokens with hover states and dark mode" is left to the developer or designer.

**Dynamic Theme inverts that.** The author supplies one or a few base colors (typically a `primary`, optionally `secondary` / `accent` / a neutral seed). The system *derives the rest*: tonal ramps, surface and background layers, borders, hover/active/disabled states, and semantic status colors -- all constrained to meet a contrast target and all expressible as plain CSS custom properties.

This is the product's core differentiator and the through-line of the [[Vision]]: color as a generative system, not a static asset. See also [[Unified Product Plan]] for how this fits the broader DSL + webapp direction.

---

## Why This Is the Gap

From a survey of existing solutions (dynamic-theme-switcher, DaisyUI, MUI CssVarsProvider, Vuetify 3, PrimeNG/PrimeVue, angular-material-css-vars, Adobe Leonardo), four problems recur:

1. **Framework lock-in.** Angular Material theming is useless outside Angular; DaisyUI assumes Tailwind; React context providers assume React. There is no one core usable across React, Vue, Angular, and plain HTML.
2. **No palette generation.** Tools expect a full theme object. When a user picks a single base color, *nothing* fills in the related shades. This is the single biggest manual burden.
3. **Accessibility is bolted on, not baked in.** Auto-contrast text exists in a few libraries (e.g. angular-material-css-vars), but most leave WCAG compliance to the developer. Arbitrary user-chosen colors routinely produce illegible combinations.
4. **Brand control is all-or-nothing.** Solutions offer either fixed preset themes or total freedom. There is no built-in "users may pick from these 5 accents" or "background stays light" constraint layer.

Dynamic Theme is the convergence of fixing all four. See [[Feature Specs]] for the per-feature breakdown and [[Accessibility]] for the contrast model in depth.

---

## Core Model

### 1. Theme Schema (constrained / brand-locked tokens)

A theme is declared as a **schema**, not a flat object. Each token carries metadata, not just a value:

```ts
defineTheme({
  primary:    { value: "#2563eb", editable: true,  generates: ["hover", "active", "subtle"] },
  secondary:  { value: "#7c3aed", editable: true },
  background: { value: "#ffffff", editable: false }, // brand-locked
  accent:     { editable: true,  constrain: { from: ["#2563eb", "#16a34a", "#dc2626"] } },
});
```

Token-level flags are the brand-control primitive that the surveyed libraries lack:

- `editable: false` -- **locked** token. The brand fixes it; no generated UI or API call may change it.
- `constrain` -- **bounded** customization. Restrict to a preset list of approved colors, or to a range (e.g. only lighten/darken the base hue within a band, never change hue). This delivers "constrained customization" -- the middle ground between fixed presets and freeform chaos.
- `generates` -- declares which derived tokens this base seeds.

### 2. Semantic Roles

Generated tokens map to **semantic roles**, not raw hex. UI code references the role; the role resolves to a CSS variable; the variable's value is derived. This indirection (primitive -> semantic -> component) is what lets one base-color change ripple coherently through the whole UI.

Baseline role set:

| Role group | Roles |
|------------|-------|
| Surfaces | `background`, `surface`, `surface-raised`, `overlay` |
| Content | `text`, `text-muted`, `text-on-primary`, `text-on-accent` |
| Interactive | `primary`, `primary-hover`, `primary-active`, `primary-subtle` |
| Borders | `border`, `border-strong`, `focus-ring` |
| Status | `success`, `warning`, `danger`, `info` (each with a `-text`/`-bg` pair) |

The author never hand-authors `text-on-primary`; it is *derived* to satisfy contrast against whatever `primary` resolves to.

### 3. enforceContrast

Contrast is a first-class, declarative constraint -- the feature that makes "generate from one color" *safe*:

```ts
enforceContrast: "AA"   // | "AAA" | { normalText: 4.5, largeText: 3.0, ui: 3.0 }
```

When set, every foreground/background pairing the system emits is guaranteed to meet the target. The generation pass computes relative luminance (or uses CSS `color-contrast()` where available), and where a derived color would fall short it is **nudged** -- lightened or darkened in a perceptually uniform space -- until the ratio is met, rather than silently shipping an illegible token. A user who picks a near-white primary still gets a legible `text-on-primary` because the system flips/adjusts it automatically.

This is the policy layer; the per-pairing math, ratio tables, and nudging strategy live in [[Accessibility]].

### 4. Palette Generation

Derivation happens in a **perceptually uniform color space** (Oklch preferred; OKLCH/HSL fallback) so that equal numeric steps read as equal visual steps and hue stays stable under lightness changes:

- **Tonal ramps** -- from each editable base, generate a lightness ramp for surfaces/subtle/hover/active states.
- **Hue-stable variants** -- hover/active shift lightness/chroma, never hue, keeping interactive states recognizably "the same color."
- **Status colors** -- success/warning/danger/info derived to harmonize with the base hue while staying distinguishable.
- **Optional colorblind-safe pass** -- shift clashing hue pairs (red/green) toward safer alternatives (blue/orange), à la Leonardo's colorblind-safe cycling.

Generation defaults are sane (a slight lighten for hover, a darken for active) so a one-color input yields a complete theme with zero further input.

---

## Architecture: framework-agnostic core + adapters

```
                 ┌────────────────────────────┐
                 │   Dynamic Theme Core (TS)  │
                 │  schema · generate ·       │
                 │  enforceContrast · emit    │
                 │  -> CSS custom properties  │
                 └────────────┬───────────────┘
                              │ writes :root { --role: value }
        ┌──────────┬──────────┼──────────┬───────────────┐
     React       Vue       Angular     Tailwind        Vanilla
     hook /    provide/    service     config/plugin   setProperty
     context    inject                 (var refs)
```

**The core is pure TS + CSS variables.** It manipulates `--role` custom properties on `:root` (or a scoped container) via `setProperty`. Because the output is just CSS, *any* environment that can ship CSS and run JS can consume it -- this is the cross-framework reach the surveyed tools never achieve.

**Adapters are thin.** They sync the core to each framework's idioms without re-implementing logic:

- **React** -- a hook/context that exposes `useTheme()` and triggers re-render only for components needing the *value in code* (icons, charts); style updates ride the CSS engine, avoiding mass re-renders. Aligns with the "CSS variables over Context" guidance.
- **Angular** -- an injectable service wrapping the DOM updates (the angular-material-css-vars pattern, but generic and not Material-bound).
- **Vue** -- `provide`/`inject` or a reactive ref calling the updater; integrates with Vuetify-style runtime themes.
- **Tailwind** -- the core's `--role` vars are referenced from Tailwind config / `bg-[var(--surface)]`, optionally emitting a plugin that mints utilities from tokens (PrimeNG-style token mapping).

### Storage & system preferences

- Multiple named themes (built-ins: Light, Dark, HighContrast) **plus** per-user saved custom themes, switchable by name.
- Optional `localStorage` persistence out of the box.
- Hooks into `prefers-color-scheme` and `prefers-contrast`, with an early-applied `[data-theme]` attribute to avoid **FOUC** on first paint.

---

## What It Does Not Do (v1 escape hatches)

- Focused on **color**. Spacing/typography scales are out of scope for v1, but the schema is extensible so authors can register their own custom variables.
- It does not ship a finished design system -- it generates the *token layer* a design system sits on.
- Generation produces sane defaults, not art direction; authors can always override any derived token explicitly.

---

## Acceptance Criteria

- Given a single base color and `enforceContrast: "AA"`, the system emits a complete role set where **every** foreground/background pairing meets AA.
- A token marked `editable: false` cannot be mutated by any adapter API or generated control.
- A token with `constrain: { from: [...] }` rejects values outside the approved set.
- The same core, unchanged, drives a React app, a Vue app, and a plain HTML page differing only by adapter.
- Switching the active theme updates the UI with no full reload and no FOUC on reload.

---

## Cross-references

- [[Unified Product Plan]] -- where Dynamic Theme sits in the product strategy
- [[Feature Specs]] -- per-feature specifications (schema, generation, adapters)
- [[Accessibility]] -- the contrast model, luminance math, colorblind passes
- [[Vision]] -- generative color as the product's core thesis
- [[Roadmap]] -- sequencing of core, adapters, and accessibility passes
