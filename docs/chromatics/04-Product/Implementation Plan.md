---
tags: [product, plan]
status: living
updated: 2026-06-25
---

# Implementation Plan

The buildable blueprint for the unified **Chromatics** platform: one SvelteKit/Bun app that lets you **programmatically define complex color schemes by manipulating color models**, where each model exposes the operations natural to *its* space — HSL hue rotation, OKLCH perceptual L/C + gamut mapping, CIE Lab ΔE, HWB whiteness/blackness, linear-sRGB physical blending — and then renders/analyses the result (contrast matrix, WCAG AA/AAA, CVD simulation, real-example previews). It joins `color-testing/test-dsl` (the live-coding REPL) with `color-testing/master` (the display/analysis app). Stack unchanged: SvelteKit 2 + Svelte 5 runes, TypeScript, Bun, CodeMirror 6, culori 4.0.2, `adapter-static`.

Related vault context: [[Unified Product Plan]], [[Product Architecture]], [[Feature Specs]], [[DSL Spec]], [[Open Questions]], the 06-Reference encyclopedia (`## Chromatics API` blocks).

---

## 0. Architecture verdict (read this first)

> [!decision] CHOSEN: a **hybrid of A (canonical value) + C (registry-driven views)** — *one immutable canonical `ColorValue` (OKLCH-stored, culori-backed) whose model behaviour lives in a data registry of model definitions, surfaced through lazy, namespaced **view objects** (`c.oklch.gamutMap()`, `c.lab.deltaE2000(other)`, `c.hsl.rotateHue(30)`).*

Each candidate was judged against six criteria. Scores are relative (●●● best).

| Criterion | A: canonical + views | B: class-per-model | C: tagged + registry |
|---|---|---|---|
| **DSL ergonomics for model-specific features** | ●●● `c.lab.deltaE2000` reads as "think in Lab, act"; view *type* scopes the feature | ●● needs explicit `.to("lab")` re-cast per use; verbose | ●●● `c.as("lab").deltaE2000` equivalent but one extra concept (`.as`) |
| **Extensibility to ~70 models** | ●● new model = registry row **+ a view class** | ● new model = a whole class file + registration + `this`-typing pain | ●●● new model = **one pure-data file**, zero class code |
| **Fit with acorn evaluator + dep graph** | ●● needs dispatch to recurse through view objects (2 member hops) | ●● `instanceof Color`→`instanceof ColorModel`, many `instanceof` sites | ●●● values are plain data, dispatch is two object lookups; dep graph untouched |
| **Autocomplete metadata** | ●● registry exists but parallel to the view classes (drift risk) | ●● registry parallel to classes; after-`.` needs model-type inference | ●●● the registry **is** the manifest; nothing to keep in sync |
| **Implementation cost** | ●● ~6 family bases + ~12 leaf view classes + registry | ● ~12 class files + bases + `this`-return typing | ●●● ~12 data files + ~6 family op-tables; least code |
| **Performance** | ●●● lazy per-mode coord cache; views are thin | ●● instantiates wrapper classes on every `.to()` | ●●● no per-model classes; data tables built once |

**Why the hybrid, decisively.** A and C agree on the two load-bearing decisions and disagree only on *where behaviour lives*: on **view classes** (A) or in **data op-tables** (C). C wins extensibility, autocomplete, and cost precisely because behaviour-as-data means **adding the 11th…70th model is a pure data addition with zero class code and zero evaluator/UI edits** — which is exactly the dominant maintenance hazard both ground digests flag (the "three-places problem", `ground-dsl §3.3`). B is the most faithful to the encyclopedia's literal `class X extends Y` taxonomy, but it pays for that fidelity with ~70 class files, an `instanceof` fan-out, and awkward `this`-return typing, and its only unique upside (compile-time "`Hsl` can't call `deltaE2000`") is irrelevant in a **dynamically-typed DSL** where the user never sees TS types.

We take **C's registry-of-model-definitions as the engine** and **A's canonical `ColorValue` + lazy view-getter ergonomics as the surface**. Concretely:

- The value is **one immutable `ColorValue`**, OKLCH-canonical, culori-backed — A's stable seam, preserving today's `_oklch` storage decision (`color.ts:22`) and the single `instanceof`/`isColorValue` inspector partition.
- Model behaviour is **data**: a `ModelDef` registry (C) where each model declares its channels, constructor, and methods. culori is wrapped behind the registry; nothing else imports it.
- The DSL reaches a model through a **view getter** (`c.oklch`, `c.lab`, `c.hwb`) that returns a lightweight `ModelView` bound to `(ColorValue, ModelDef)` — A's nested-member ergonomics, but the view is a generic object backed by the data table, **not** a hand-written class per model. So `c.lab.deltaE2000(other)` works, `deltaE2000` only appears on the Lab view, and adding a model never adds a class.
- The **registry is literally the autocomplete/highlighter/docs manifest** (C). One source of truth, derived four ways.

This keeps the encyclopedia's **method-altitude taxonomy** (which method exists on which family) as the *organising principle of the data tables* (`HUE_OPS`, `PERCEPTUAL_CYL_OPS`, `LAB_OPS`, `RGB_OPS` composed into each `ModelDef`) without instantiating the class hierarchy at runtime. Confidence: ~0.82.

The encyclopedia's `## Chromatics API` block shape is the registry schema 1:1 (verified against `06-Reference/Color Models/Perceptual/Oklch.md`: Class+extends, a Channels table with `DSL accessor` column, a `DSL Constructor`, a `Model-specific methods` list, an `Inherited` list, a `Priority`). The 73 such blocks map directly to 73 `ModelDef` rows.

---

# 1. Product summary & guiding principles

**Chromatics is a color-model manipulation environment.** You write a small reactive script that constructs colors in whatever model is natural, applies each model's characteristic operation, and relates colors to each other; the platform recomputes the whole scheme as you type and renders it through analysis surfaces (contrast matrix, WCAG, CVD, real-page previews). The thesis — and the reason ~70 models were researched — is that **the model is the unit of expression**: hue rotation belongs to HSL, perceptual lightness/chroma and gamut mapping to OKLCH, color-difference ΔE to CIE Lab, whiteness/blackness to HWB, physically-correct blending to linear-sRGB. This is explicitly **not** an OKLCH-only tool; OKLCH is merely the canonical storage space.

Guiding principles:

1. **Model-manipulation thesis.** Every model exposes *its own* special features where they are natural. The view a color is "thought in" determines which operations are reachable (`c.lab.deltaE2000`, `c.hwb.addWhite`). You cannot call `deltaE2000` except through a Lab view, or `addWhite` except through `.hwb` — discoverability and correctness are carried by the view.
2. **Text is the single source of truth.** `source: string` → `evaluate()` → `EvalResult` → adapter → `Scheme`. No surface mutates the scheme; everything downstream is `$derived`. Source round-trips through URL hash + localStorage.
3. **Relationships are first-class and reactive.** Named variables form a dependency DAG; editing a base color recomputes everything that derives from it. This dependency graph is the product differentiator and must survive every seam (it is preserved on `SchemeEntry.deps`, never dropped into a plain `ColorGroup[]`).
4. **One canonical value, many coordinate systems.** A color is "a color", not "an OKLCH color." It can be read and manipulated in any model's coordinates without losing identity; conversions are culori projections behind the registry.
5. **culori is the conversion backend; the registry is the seam.** culori stays for all conversion math (it is not the novel contribution — [[Open Questions]] Q1 lean C/A). The future `@lilbunnyrabbit/chromatics` package is a *thin* method layer added on top, swappable behind the registry with zero upstream churn.
6. **One manifest drives the whole language surface.** The model registry is the single source for the evaluator environment, the CodeMirror highlighter, autocomplete, and docs — killing the three-places drift before it explodes across dozens of methods.
7. **Forgiving, immutable, perceptual.** Every operation returns a new value (immutability keeps dep tracking reliable). Parse errors are terminal-and-single; runtime errors are per-statement (one bad line, the rest still render). Out-of-gamut is *data* (a flag), not an error; you correct it explicitly with `gamutMap()`. Color equality is perceptual (`deltaE`/`isPerceptiblyDifferent`), not reference `===`.

---

# 2. Color-model architecture (the core)

## 2.1 The value: `ColorValue`

One immutable, canonical value. OKLCH is the storage space (today's decision, `color.ts:22`); every other model is a lazily-cached culori projection. Behaviour does **not** live on this class — it lives in the registry and is surfaced through views.

```ts
// src/lib/models/value.ts
import type { Oklch, Color as CuloriColor } from 'culori';
import { toMode } from './registry';          // the ONLY culori seam

export type PlainObject = { [k: string]: DSLValue };
export type DSLValue =
  number | string | boolean | ColorValue | ColorValue[] | PlainObject | DSLFunction;
export type DSLFunction = (...args: DSLValue[]) => DSLValue;

export function isColorValue(v: unknown): v is ColorValue { return v instanceof ColorValue; }

/** Canonical immutable color. OKLCH-stored; per-mode coords cached lazily. */
export class ColorValue {
  private readonly _oklch: Oklch;
  private readonly _proj = new Map<string, CuloriColor>();   // generalizes today's _hsl/_rgb/_hex
  private readonly _views = new Map<string, ModelView>();     // memoized view objects

  constructor(c: CuloriColor) {
    const ok = toMode('oklch')(c) as Oklch | undefined;
    if (!ok) throw new Error('Invalid color');
    this._oklch = ok;
  }

  /** Memoized culori projection into any mode (the implicit-conversion core). */
  project(mode: string): CuloriColor {
    let p = this._proj.get(mode);
    if (!p) {
      const out = toMode(mode)(this._oklch);
      if (!out) throw new Error(`Cannot convert to ${mode}`);
      p = out; this._proj.set(mode, p);
    }
    return p;
  }

  /** Build a sibling ColorValue from a culori obj in any mode. */
  static from(c: CuloriColor): ColorValue { return new ColorValue(c); }

  /** Read a namespaced channel (ok_l, lab_a, hwb_w, lr…) regardless of current "view". */
  channel(key: string): number {
    const ch = CHANNELS.get(key);                 // built once from the registry
    if (!ch) throw new Error(`Unknown channel: ${key}`);
    const v = (this.project(ch.modelId) as any)[ch.culoriField];
    return (v ?? 0) * (ch.scale ?? 1);
  }

  /** The view system: c.oklch / c.lab / c.hwb (getters installed from the registry). */
  view(modelId: string): ModelView {
    let v = this._views.get(modelId);
    if (!v) { v = new ModelView(this, getModel(modelId)!); this._views.set(modelId, v); }
    return v;
  }

  /** Default CSS = OKLCH; per-model CSS via the view (c.hwb.toCSS()). */
  toCSS(): string { return getModel('oklch')!.toCSS(this); }
  get hex(): string { return formatHex(this._oklch) ?? '#000000'; }
  get inGamut(): boolean { return displayable(this._oklch); }
  toString(): string { return this.hex; }
}
```

The value is plain enough to serialize (canonical `_oklch` + the source text reproduce everything) and keeps the existing `instanceof`-based inspector partition working via `isColorValue`.

## 2.2 The view: one generic class, data-backed

A `ModelView` is the **one** runtime class (not 70). It binds a `ColorValue` to a `ModelDef` and resolves channel reads and method calls against the model's data table. This is the A-ergonomics / C-data hybrid in a single object.

```ts
// src/lib/models/view.ts
export class ModelView {
  constructor(readonly self: ColorValue, readonly def: ModelDef) {}

  /** The evaluator's member dispatch resolves `prop` against this. */
  member(prop: string): DSLValue | DSLFunction | undefined {
    // 1) this model's channels (un-prefixed inside the view: c.hsl.h, c.lab.a)
    const ch = this.def.channels.find(c => c.localKey === prop || c.key === prop);
    if (ch) return (this.self.project(this.def.id) as any)[ch.culoriField] ?? 0;
    // 2) this model's methods (own + family-inherited, composed in the registry)
    const m = this.def.methods.get(prop);
    if (m) {
      if (m.kind === 'accessor') return m.impl(this.self, []);          // e.g. isGray, luminance
      return ((...args: DSLValue[]) => m.impl(this.self, args)) as DSLFunction;
    }
    // 3) cross-model re-entry: c.lab.oklch — a view exposes sibling views too
    if (getModel(prop)) return this.self.view(prop) as unknown as DSLValue;
    return undefined;
  }
}
```

`m.impl(self, args)` always receives the **canonical `ColorValue`** as `self` and converts internally via `self.project(...)` — so a method authored on the Lab view accepts *any* color as `other` and projects it to Lab. Methods return a new `ColorValue` (operations), a number/boolean/string (ΔE/contrast/predicates), or `ColorValue[]` (scales/harmony).

## 2.3 The registry (the heart) — `ModelDef`, `MethodDef`, families

```ts
// src/lib/models/types.ts
import type { Color as CuloriColor } from 'culori';
import type { ColorValue, DSLValue } from './value';

export interface ChannelDef {
  key: string;          // namespaced DSL accessor on the value: "ok_l" | "lab_a" | "hwb_w" | "lr"
  localKey: string;     // un-prefixed name inside the view: "l" | "a" | "w" | "r"
  label: string;        // "L" | "a" | "whiteness"
  culoriField: string;  // field on the culori color of this mode: "l" | "a" | "w" | "r"
  range: [number, number];
  scale?: number;       // accessor scale (e.g. 255 for byte-RGB views; default 1)
}

export interface ParamDef {
  name: string;
  kind: 'number' | 'color' | 'string' | 'enum' | 'object';
  optional?: boolean;
  enumValues?: string[];
}

export interface MethodDef {
  name: string;                                   // "gamutMap" | "deltaE2000" | "addWhite"
  kind: 'method' | 'accessor';                    // accessor = no-call getter (isGray, luminance)
  params: ParamDef[];
  returns: 'color' | 'colors' | 'number' | 'boolean' | 'string';
  doc: string;                                    // one-line help → autocomplete info + docs
  impl: (self: ColorValue, args: DSLValue[]) => DSLValue;   // pure; converts via registry
  inheritedFrom?: string;                         // family name, for docs grouping
}

export type Family = 'hue' | 'perceptual-cylindrical' | 'lab' | 'rgb' | 'subtractive' | 'root';

export interface ModelDef {
  id: string;                                     // culori mode where backed: "oklch" | "lab" | "hwb" | "lrgb"
  label: string;                                  // "OKLCH" | "CIE Lab"
  family: Family;
  ctor?: { name: string; params: ParamDef[]; build: (a: number[]) => CuloriColor }; // OKLCH(l,c,h)
  channels: ChannelDef[];
  methods: Map<string, MethodDef>;                // own ⊕ family-inherited, composed at register()
  toCSS: (self: ColorValue) => string;
  backed: boolean;                                // true = culori conversion works; false = stub/polyfill
  priority?: 'critical' | 'high' | 'normal';      // from encyclopedia, for docs ordering
}
```

The encyclopedia's **method altitude** (which method exists on which family) is expressed as **shared op-tables composed into each `ModelDef`**, not as class inheritance:

```ts
// src/lib/models/families.ts — authored once, spread into model defs
export const HUE_OPS: MethodDef[] = [           // naive (RGB-cylindrical) harmony — opt-in "thinking in HSL"
  mkRotateHue('hue'), mkComplementary('hue'), mkAnalogous('hue'),
  mkTriadic('hue'), mkTetradic('hue'), mkSplitComplementary('hue'),
];
export const PERCEPTUAL_CYL_OPS: MethodDef[] = [ // perceptual harmony (correct hues) + gamut + L/C ops
  mkRotateHue('perceptual'), mkComplementary('perceptual'), mkAnalogous('perceptual'),
  mkTriadic('perceptual'), mkTetradic('perceptual'), mkSplitComplementary('perceptual'),
  mkAdjustChroma(), mkAtLightness(), mkMaxChroma(), mkIsInGamut(), mkGamutMap(),
];
export const RGB_OPS: MethodDef[] = [
  mkInvert(), mkGrayscale(), mkLuminance(), mkBlend('lrgb'),
  mkContrastWCAG(), mkContrastAPCA(), mkMeetsAA(), mkMeetsAAA(), mkSimulateCVD(),
];
export const LAB_OPS: MethodDef[] = [ mkMix(/*perceptual, this lab space*/), mkDeltaEgeneric() ];
```

A concrete model file is then pure data (no class):

```ts
// src/lib/models/defs/hwb.ts  — 1:1 with 06-Reference/Color Models/Hue/HWB.md
import { register, defineModel } from '../registry';
import { HUE_OPS } from '../families';
import { clamp01, num, mkToCSS } from '../util';

register(defineModel({
  id: 'hwb', label: 'HWB', family: 'hue', backed: true,
  ctor: { name: 'HWB', params: [p('h'), p('w'), p('b')],
          build: ([h, w, b]) => ({ mode: 'hwb', h, w, b }) },
  channels: [
    { key: 'hwb_h', localKey: 'h', label: 'Hue',        culoriField: 'h', range: [0, 360] },
    { key: 'hwb_w', localKey: 'w', label: 'Whiteness',  culoriField: 'w', range: [0, 1] },
    { key: 'hwb_b', localKey: 'b', label: 'Blackness',  culoriField: 'b', range: [0, 1] },
  ],
  ownMethods: [
    method('addWhite', ['amount'], 'color', 'Raise whiteness (tint toward white)',
      (self, [a]) => ColorValue.from({ ...self.project('hwb'), w: clamp01(self.channel('hwb_w') + num(a)), mode: 'hwb' })),
    method('addBlack', ['amount'], 'color', 'Raise blackness (shade toward black)',
      (self, [a]) => ColorValue.from({ ...self.project('hwb'), b: clamp01(self.channel('hwb_b') + num(a)), mode: 'hwb' })),
    method('pureHue', [], 'color', 'Set whiteness and blackness to 0',
      (self) => ColorValue.from({ ...self.project('hwb'), w: 0, b: 0, mode: 'hwb' })),
    accessor('isGray', 'boolean', 'Whiteness + blackness ≥ 1',
      (self) => self.channel('hwb_w') + self.channel('hwb_b') >= 1),
    mkToCSS('hwb'),
  ],
  inherit: HUE_OPS,                                // composed into `methods` at register()
}));
```

`defineModel` merges `inherit` ⊕ `ownMethods` into the `methods: Map`, builds the namespaced channel index, and validates the `(self, args)` impl contract. `register()` adds the def to the registry and contributes its channels to the global `CHANNELS` map. **culori is wrapped only in `registry.ts`:**

```ts
// src/lib/models/registry.ts — the ONLY module importing culori
import { converter, parse, formatHex, clampChroma, toGamut, wcagContrast, wcagLuminance,
         displayable, inGamut, differenceCie76, differenceCie94, differenceCiede2000,
         differenceCmc, differenceEuclidean, filterDeficiencyProt, filterDeficiencyDeuter,
         filterDeficiencyTrit, filterGrayscale } from 'culori';

const _conv = new Map<string, ReturnType<typeof converter>>();
export function toMode(mode: string) {
  let c = _conv.get(mode);
  if (!c) { c = converter(mode as any); _conv.set(mode, c); }
  return c;
}
const _registry = new Map<string, ModelDef>();
export const CHANNELS = new Map<string, ChannelDef & { modelId: string }>();
export function register(def: ModelDef) {
  _registry.set(def.id, def);
  for (const ch of def.channels) CHANNELS.set(ch.key, { ...ch, modelId: def.id });
}
export function getModel(id: string) { return _registry.get(id); }
export function allModels() { return [..._registry.values()]; }
```

## 2.4 Representative method signatures (the special features)

All `impl` bodies receive the canonical `self: ColorValue` and convert via `self.project(...)`. Backings verified present in culori 4.0.2 (`ground-models §3`).

```ts
// OKLCH (perceptual cylindrical) — gamut map is the CSS Color 4 binary chroma search
mkGamutMap():       impl = (self, [space='rgb']) => ColorValue.from(toGamut(str(space), 'oklch')(self.project('oklch')));
mkMaxChroma():      impl = (self, [space='rgb']) => binarySearchChroma(self.project('oklch'), str(space)); // returns number
atLightness():      impl = (self, [L])  => ColorValue.from({ ...self.project('oklch'), l: num(L), mode: 'oklch' });
atChroma():         impl = (self, [C])  => ColorValue.from({ ...self.project('oklch'), c: num(C), mode: 'oklch' });
tintScale():        impl = (self, [n])  => perceptualRamp(self, +1, num(n)); // returns ColorValue[]
isInP3():           impl = (self)       => inGamut('p3')(self.project('oklch'));

// CIE Lab — the ΔE family (the headline distinct feature)
deltaE2000():       impl = (self, [o])  => differenceCiede2000()(self.project('lab'), color(o).project('lab'));
deltaE94():         impl = (self, [o, w]) => differenceCie94(w?.kL, w?.kC, w?.kH)(self.project('lab'), color(o).project('lab'));
deltaECMC():        impl = (self, [o, lc]) => differenceCmc(lc?.l, lc?.c)(self.project('lab'), color(o).project('lab'));
isPerceptiblyDifferent(): impl = (self, [o, t=2.3]) => (differenceCiede2000()(self.project('lab'), color(o).project('lab')) > num(t));

// Oklab — the DEFAULT mix() space (matches CSS color-mix) + fast ΔE
deltaEok():         impl = (self, [o])  => differenceEuclidean('oklab')(self.project('oklab'), color(o).project('oklab'));
mix():              impl = (self, [o, r=0.5]) => lerpInMode(self, color(o), 'oklab', num(r)); // ColorValue

// HSL — tint/shade/tone, naive harmony inherited from HUE_OPS
tint():  (self,[a]) => /* toward white in HSL L */;   shade(): /* toward black */;   tone(): /* toward gray (S) */;

// Linear sRGB — physically-correct blend (distinct from perceptual mix)
blend():            impl = (self, [o, r=0.5]) => lerpInMode(self, color(o), 'lrgb', num(r));
premultiply():      impl = (self, [a]) => scaleChannels(self, 'lrgb', num(a));

// sRGB / RGBModel — a11y + CVD (reuses master's filters)
contrastWCAG():     impl = (self, [o])  => wcagContrast(self.project('rgb'), color(o).project('rgb'));
meetsAA():          impl = (self, [o, large=false]) => wcagContrast(...) >= (large ? 3 : 4.5);
simulateCVD():      impl = (self, [type, sev=1]) => ColorValue.from(CVD_FILTER[str(type)](num(sev))(self.project('rgb')));
```

## 2.5 The P0/P1 model set (~12, all culori-backed)

`srgb` · `oklch` · `oklab` · `hsl` · `hsv` · `hwb` · `lab` · `lch` · `lrgb` (linear) · `p3` · `xyz` (hub) · `lms`-via-`filterDeficiency*` for CVD. This set expresses **every** headline special feature: hue rotation (HSL), perceptual L/C + gamut map (OKLCH), ΔE (Lab), white/black (HWB), linear blend (lrgb), WCAG/CVD (sRGB). Deferred-but-wired (registered, `backed:false`, methods throw an actionable error): `hct` (`tonalPalette`/`materialRoles`), `cmyk`, `hsluv`, `cam16`, APCA (needs `apca-w3`). These advertise in autocomplete/docs (dimmed) so the surface is forward-compatible while impls land behind the future package.

---

# 3. The DSL language — final form

Unchanged core: named variables, reactive dependency DAG, immutable values, per-statement error tolerance, no `new`/loops/function-defs (constructors and ops are global functions / member methods). Additions for multi-model:

- **Constructors** (global fns in the env, generated from the registry): `OKLCH(l,c,h)`, `OKLAB(l,a,b)`, `HSL(h,s,l)`, `HSV(h,s,v)`, `HWB(h,w,b)`, `LAB(l,a,b)`, `LCH(l,c,h)`, `RGB(r,g,b)`, `P3(r,g,b)`, `hex(str)`, `XYZ(x,y,z)`. Each yields the **same** `ColorValue`; the constructor name only chooses how inputs are interpreted.
- **Namespaced channel accessors** on any value: `c.ok_l`, `c.lab_a`, `c.hwb_w`, `c.lr`, `c.r/g/b`, `c.h/s/l` (HSL keeps the un-prefixed trio). Read-only; to write a channel you use a method.
- **View namespaces** (the conversion-and-act syntax): `c.oklch`, `c.lab`, `c.hsl`, `c.hwb`, `c.lin`, `c.srgb`, `c.p3`, … each exposing only that model's methods. `c.hsl.rotateHue(30)`, `c.oklch.gamutMap("p3")`, `c.lab.deltaE2000(other)`, `c.lin.blend(other, 0.5)`. No string-keyed `as("lab")` in the user surface — view getters are typo-proof and groupable for completion.
- **Free functions** for the common case: `mix(a,b,r)` (perceptual, Oklab-default), `contrast(a,b)`, `deltaE(a,b)`, `clamp/abs/min/max/round/floor/ceil`.
- **Object/array literals + indexing** (the blocking prerequisite): options objects (`c.lab.deltaE94(o, {kL:2})`), array-returning methods (`tintScale`, `triadic`), and indexing (`scale[0]`).
- **Equality is perceptual:** `==`/`===` stay reference-based (documented), but the idiom is `a.lab.deltaE2000(b) < 1` or `a.lab.isPerceptiblyDifferent(b)`.

### Worked example A — perceptual base, HSL-rotated accents, Lab-verified spacing, WCAG-gated text

```js
base    = OKLCH(0.62, 0.13, 264)

accent1 = base.hsl.rotateHue(40)          // hue rotation natural in HSL
accent2 = base.hsl.rotateHue(150)
accent3 = base.hsl.rotateHue(280)

sep_12  = accent1.lab.deltaE2000(accent2) // perceptual distance natural in Lab
wellSpaced = min(sep_12, accent1.lab.deltaE2000(accent3)) > 15

bg      = base.oklch.atLightness(0.18).oklch.gamutMap()   // perceptual L + gamut map in OKLCH
surface = base.oklch.atLightness(0.24).oklch.gamutMap()

fg      = bg.srgb.contrastWCAG(base) >= 4.5 ? base : OKLCH(0.95, 0.02, 264)
aa_pass = fg.srgb.contrastWCAG(bg) >= 4.5
```

DAG: `base → {accent1,accent2,accent3,bg,surface}`; `{accent1,accent3} → wellSpaced`; `base,bg → fg → aa_pass`. Edit `base` and everything recomputes — four models, one color lineage.

### Worked example B — HWB ramp + linear-sRGB frosted overlay + CVD safety

```js
brand   = hex("#6c5ce7")
tintA   = brand.hwb.addWhite(0.15)        // whiteness/blackness natural in HWB
shadeA  = brand.hwb.addBlack(0.15)
overlay = brand.lin.blend(hex("#ffffff"), 0.4)   // physically-correct linear blend
safe    = brand.inGamut ? brand : brand.oklch.gamutMap()

ok_cvd  = brand.lms.simulateCVD("deuteranopia")  // CVD from master, now programmable
gap     = ok_cvd.lab.deltaE2000(shadeA)          // measure post-CVD separation in Lab
```

### Worked example D — perceptual tonal scale via array methods + indexing

```js
seed   = OKLCH(0.55, 0.15, 265)
scale  = seed.oklch.tintScale(5)          // ColorValue[] — even perceptual ramp
c100   = scale[3]
triad  = seed.oklch.triadic()             // perceptual harmony (correct hues, not HSL)
accentA = triad[1].oklch.gamutMap()
```

---

# 4. Repository & module structure

`adapter-static`, `svelte.config.js` unchanged. The flat `src/lib/dsl/{lang,evaluator,color}.ts` is refactored into domain folders. `package.json` keeps the `svelte-package`/`publint` build; **add `"test": "bun test"`**.

```
color-testing/
├── svelte.config.js                    # UNCHANGED (adapter-static, base path)
├── package.json                        # + scripts.test = "bun test"
├── bunfig.toml                         # NEW (optional test preload)
├── src/
│   ├── lib/
│   │   ├── dsl/
│   │   │   ├── evaluator.ts             # acorn + AST walk + Scope + deps (+ Object/Array/index nodes)
│   │   │   ├── environment.ts           # NEW: createEnvironment() built from the manifest
│   │   │   ├── lang.ts                   # CodeMirror StreamLanguage — manifest-driven token sets
│   │   │   ├── complete.ts              # NEW: @codemirror/autocomplete source (context-aware)
│   │   │   └── manifest.ts              # NEW: registry → {constructors,builtins,accessors,methods,byModel}
│   │   ├── models/
│   │   │   ├── value.ts                 # NEW: ColorValue + DSLValue union + isColorValue
│   │   │   ├── view.ts                  # NEW: the one ModelView class
│   │   │   ├── types.ts                 # NEW: ModelDef, ChannelDef, MethodDef, ParamDef
│   │   │   ├── families.ts              # NEW: HUE_OPS / PERCEPTUAL_CYL_OPS / LAB_OPS / RGB_OPS
│   │   │   ├── registry.ts              # NEW: register/getModel/toMode/CHANNELS — ONLY culori importer
│   │   │   ├── util.ts                  # NEW: num/str/color coercion, clamp01, binarySearchChroma, mkToCSS…
│   │   │   └── defs/                     # NEW: one pure-data file per model (the ~70)
│   │   │       ├── srgb.ts oklch.ts oklab.ts hsl.ts hsv.ts hwb.ts
│   │   │       ├── cielab.ts cielch.ts linear-srgb.ts display-p3.ts xyz.ts lms.ts
│   │   │       ├── … (rec2020, a98, hsluv*, hct*, cmyk*, cam16*  — *stub)
│   │   │       └── index.ts             # imports every def (side-effect register()); barrel
│   │   ├── analysis/
│   │   │   ├── contrast.ts              # contrastRatio, contrastRatioAlpha (alpha composite in lrgb)
│   │   │   ├── wcag.ts                  # wcagLevels, wcagColor
│   │   │   └── cvd.ts                   # simulateVision, visionSimulations (10 modes)
│   │   ├── scheme/
│   │   │   ├── types.ts                 # NEW: Scheme, SchemeEntry, SchemeGroup, Roles, AuthoringModel
│   │   │   ├── adapter.ts               # NEW: schemeFromEvalResult — the bridge that unifies the apps
│   │   │   └── roles.ts                 # autoAssign, emptyRoles, varsFromRoles (fallback chain)
│   │   ├── export/
│   │   │   ├── css-vars.ts  tokens.ts  tailwind.ts  markdown.ts
│   │   ├── persistence/
│   │   │   ├── url-hash.ts  local-storage.ts
│   │   ├── state/
│   │   │   └── app.svelte.ts            # NEW: the runes store (source → result → scheme)
│   │   ├── components/
│   │   │   ├── Editor.svelte            # CodeMirror host (+ autocompletion ext)
│   │   │   ├── Inspector.svelte         # ColorVarRow / ValueRow / ErrorBar / DepsChips
│   │   │   ├── Matrix.svelte            # MatrixCell / MatrixHeaderCell / dialogs
│   │   │   ├── Preview.svelte           # demos/{Landing,Dashboard,Blog}Demo.svelte
│   │   │   ├── RoleMapper.svelte  AuditPanel.svelte  ExportPanel.svelte
│   │   │   ├── TopBar.svelte  TabBar.svelte
│   │   │   └── Docs.svelte              # generated from the manifest
│   │   └── index.ts                     # package entry (svelte-package)
│   └── routes/
│       ├── +layout.svelte              # Tailwind v4 import — UNCHANGED
│       ├── +page.svelte                # slimmed shell: orchestrates components, holds source $state
│       └── examples/                   # example scripts (import.meta.glob), incl. brand-dark.ts
└── tests/
    ├── evaluator.test.ts   models.test.ts   analysis.test.ts
    ├── manifest.test.ts                # anti-drift gate
    └── acceptance/brand-dark.test.ts   # end-to-end release gate
```

---

# 5. Display / preview integration

The two apps meet at **one adapter**. The DSL emits a flat `Map`/`order`; the display half consumes a flat indexed list with groups, roles, deps, and authoring model preserved.

## 5.1 The scheme adapter (`src/lib/scheme/adapter.ts`)

```ts
type AuthoringModel = 'oklch'|'hsl'|'rgb'|'hwb'|'lab'|'lch'|'lrgb'|'hex'|'p3'|'unknown';

interface SchemeEntry {
  name: string;            // Variable.name → color .name
  color: ColorValue;       // canonical multi-model value
  model: AuthoringModel;   // inferred from Variable.node → which coords to display
  deps: string[];          // Variable.deps  (THE graph, preserved)
  line: number;            // Variable.line  (source mapping / future two-way edit)
  description?: string;    // source slice of the RHS (matrix + info dialog + markdown)
  roleHint?: SemanticRole; // explicit role if the DSL declared one (later)
}
interface SchemeGroup { label: string; entries: SchemeEntry[] }
interface Scheme {
  groups: SchemeGroup[];   // ordered, labeled — group label = section header
  entries: SchemeEntry[];  // flat, in DSL `order` — THE universal index space
  byName: Map<string, SchemeEntry>;
  errors: EvalError[];     // carried through → error bar
  nonColorVars: Variable[];// carried through → inspector VALUES section
}

function schemeFromEvalResult(result: EvalResult, source: string): Scheme;
```

Steps: (1) partition `result.order` on `isColorValue` (the existing `colorVars`/`nonColorVars` split); (2) **model inference** from `Variable.node` — if the RHS root is a `CallExpression` to a known constructor, use it; if it's a method chain, inherit the receiver's model; else `'unknown'`→oklch coords (best-effort, never affects correctness); (3) **description** = `source` slice via `node.loc`; (4) **grouping** = name/prefix heuristic (`bg*`→Background, `{success,warning,error,info}`→Semantic, `{triad_*,analog_*}`→Harmony, rest→Core) else one default group; (5) carry `errors`/`nonColorVars`. A `toColorGroups(scheme)` shim reproduces master's exact `ColorGroup[]` shape so ported code is mechanical.

## 5.2 Panels (ported from master, reading the adapter)

| Panel | From | Reads | Notes |
|---|---|---|---|
| Editor | test-dsl `Editor.svelte` | `source` | + autocompletion ext |
| Inspector | test-dsl `+page.svelte` | `Scheme.entries`, `nonColorVars`, `errors` | **model-aware coord readout** (`formatCoords(entry)`), gamut badge, deps chips |
| Contrast Matrix | master `+page.svelte` | `Scheme` + `visionSim` + `fgAlpha` | fg×bg WCAG grid; mini specimen per cell; detail + info dialogs |
| Preview | master `demo/+page.svelte` | `Scheme` + `Roles` + `opacities` + `visionSim` | role mapper → `--*` CSS vars → Landing/Dashboard/Blog |
| Audit | master demo right rail | `Scheme` + `Roles` | ~21 real pairs, `{fails}/{total}` |
| Export | NEW | resolved `Scheme` + `Roles` | CSS vars / JSON tokens / Tailwind / Markdown |

## 5.3 Reactive data flow (Svelte 5 runes store, `src/lib/state/app.svelte.ts`)

```
source: string
  │ onSourceChange() — 100ms debounce (preserved from +page.svelte:57)
  ▼
evaluate(source) → EvalResult                       [evaluator, value-agnostic]
  │ schemeFromEvalResult(result, source)            [ADAPTER]
  ▼
scheme = $derived(...)  ──┬─► Inspector  (swatch · model coords · gamut · deps chips)
                          ├─► Matrix     (+visionSim view-transform, +fgAlpha 150ms debounce)
                          ├─► Preview    (+Roles → CSS vars; +visionSim)
                          └─► Export     (CSS / JSON / Tailwind / Markdown)
```

Unidirectional: no panel mutates `scheme` (it is `$derived`). CVD is applied as a per-surface view transform (`simulateVision`) so the store holds the canonical scheme. `fgAlpha` keeps the master 150ms matrix debounce separate from the live slider. Roles/opacities persist in `localStorage` keyed by a stable scheme id. Constants preserved verbatim: WCAG thresholds (7/4.5/3), `wcagColor` hexes, the 10 CVD modes + filter params, opacity defaults (0.65/0.38/0.85/0.70), the 12 role names + fallback chain, the ~21 audit pairs.

---

# 6. Autocomplete, persistence, export — one manifest

## 6.1 The manifest (`src/lib/dsl/manifest.ts`) drives four consumers

```ts
interface TokenManifest {
  constructors: { name: string; params: ParamDef[]; doc: string }[]; // OKLCH, HSL, HWB, LAB…
  builtins: string[];                  // mix, contrast, deltaE, clamp, abs, min, max, round, floor, ceil
  accessors: Map<string, ChannelDef>;  // every namespaced channel key + gamut getters
  methods: Map<string, MethodDef>;     // method name → def (signature/doc/return)
  byModel: Map<string, ModelDef>;      // for context-aware grouping
}
export const manifest = buildManifest(allModels(), CHANNELS);
```

1. **Evaluator environment** (`environment.ts`): iterate `manifest.constructors` → `env.set(name, (...a) => ColorValue.from(ctor.build(a.map(num))))`; wire `builtins` (`mix`/`contrast`/`deltaE`/math). Replaces the hand-written `createEnvironment` (`evaluator.ts:31-64`).
2. **Highlighter** (`lang.ts`): replace the four hardcoded Sets (`lang.ts:4-14`) with `manifest` sets; **fix the dead after-dot branches** (`lang.ts:65-69`) so methods/accessors color by manifest membership, not by whether `(` follows.
3. **Autocomplete** (`complete.ts`, new — none exists today): a CodeMirror `completionSource`, context-aware — at expression start suggest constructors + builtins + live user vars (`EvalResult.order`); after `color.` suggest channel accessors + view names + flat shortcuts; after `color.<view>.` suggest **only that view's** methods + channels; inside a constructor-arg position suggest nothing colorful. `info` = `MethodDef.doc`; `detail` = return type + signature from `params`. Wired as `autocompletion({ override: [chromaComplete] })` in `Editor.svelte`.
4. **Docs** (`Docs.svelte`): render `manifest` grouped by model family + priority — replaces the hand-authored HTML overlay (`+page.svelte:147-263`).

**Anti-drift test** (`tests/manifest.test.ts`): every `manifest.accessors` key resolves on a fresh `ColorValue`; every `manifest.methods` name is callable on its model's view; highlighter sets == manifest sets. The structural guarantee that the three-places problem stays solved.

## 6.2 Persistence (`src/lib/persistence/`, client-only)

- `url-hash.ts`: `encodeHash({source, roles?})` → `location.hash` (`encodeURIComponent(btoa(...))` of compact `{s,r}` JSON; tolerant decode). The share link; source text is the single source of truth.
- `local-storage.ts`: named schemes `chromatics:scheme:<name>` → `{source, roles, opacities, savedAt}` + `chromatics:last` autosave (debounced). Load priority on boot: `location.hash` > `chromatics:last` > default example.

## 6.3 Export (`src/lib/export/`) — all `Scheme` → string, pure/testable

- `css-vars.ts` → `:root { --bg: oklch(L C H); … }` via `ColorValue.toCSS()` (per-model toggle: emit each color in its authoring model vs forced sRGB/oklch).
- `tokens.ts` → W3C DTCG JSON (`{ "$type":"color", "$value":"#rrggbb", "$extensions":{ chromatics:{ oklch:"…" } } }`).
- `tailwind.ts` → Tailwind v4 `@theme` block + legacy `colors` object.
- `markdown.ts` → the `name | hex | coords | comment` aligned table (master's "Copy Markdown").

---

# 7. Phased build plan

Each phase is independently shippable and ends at an **acceptance gate** (a `bun test` suite or a manual check). The `brand-dark` golden gate must stay green from P1 onward.

## P0 — Scaffold & consolidate (one app)
**Goal:** one running app off `test-dsl`, the blocking evaluator gap fixed, the token manifest seeded — no behaviour change for the user yet.
**Tasks:**
- Add `"test": "bun test"` to `package.json`; add `bunfig.toml` if needed.
- **Fix the blocking prerequisite:** add `ObjectExpression`, `ArrayExpression`, and a computed-member **array-index** branch to `evalNode` (`evaluator.ts`, before the `default` at `:253`). Widen `DSLValue` (`:7`) with `ColorValue[]` and `PlainObject`. This un-deads `shift({l})`/`derive({l})` (`color.ts:139,149`).
- Extract `createEnvironment` into `dsl/environment.ts`; introduce a minimal `manifest.ts` (still just today's OKLCH/HSL/RGB surface) and a `token-manifest`-seeded `lang.ts` to retire the dead `METHODS`/`PROPERTIES` branches (`lang.ts:65-69`).
- Move the two `EXAMPLES` into `routes/examples/*.ts`.
**Files:** `evaluator.ts`, `dsl/environment.ts`, `dsl/manifest.ts`, `dsl/lang.ts`, `routes/examples/`, `package.json`, `tests/evaluator.test.ts`.
**Acceptance gate:** `bun test tests/evaluator.test.ts` green — including new regression locks: `shift({l:0.1})` and `derive({l:0.2})` evaluate to the expected `_oklch`; `[a,b][1]` indexes; `a=OKLCH(...); b=a.lighten(.1)` ⇒ `b.deps===['a']`; parse error is terminal+single, runtime error is per-statement with a line. App still runs (`bun run dev`) with both examples rendering.

## P1 — Multi-model engine + ~10 core models + tests
**Goal:** the registry/value/view engine with the P0/P1 model set, behaviour-preserving for existing scripts.
**Tasks:**
- Build `models/{types,value,view,registry,families,util}.ts`. Port today's OKLCH/HSL/RGB/hex behaviour into `defs/{oklch,hsl,srgb}.ts` (so shipped examples are byte-identical).
- Add `defs/{oklab,hsv,hwb,cielab,cielch,linear-srgb,display-p3,xyz,lms}.ts` with their special-feature methods (gamutMap/maxChroma/atLightness/tintScale; deltaE76/94/2000/CMC; addWhite/addBlack/pureHue; blend/premultiply; simulateCVD).
- Switch the evaluator's member dispatch (`evaluator.ts:198-219`) and `color()` guard (`:78`) from `instanceof Color` to `isColorValue`/`ModelView`-aware; make the `MemberExpression` arm delegate to `ColorValue` channel/view getters and `ModelView.member()`.
- Promote `brand-dark` to `routes/examples/brand-dark.ts`; snapshot golden hexes.
**Files:** `models/*`, `evaluator.ts`, `tests/models.test.ts`, `tests/acceptance/brand-dark.test.ts`.
**Acceptance gate:** `bun test tests/models.test.ts tests/acceptance/brand-dark.test.ts` green — per-model ctor→channel round-trips within ε; cross-model accessors (`OKLCH(...).hwb_w`, `.lab_a`, `.lr`) match a direct culori convert; `deltaE2000` matches known pairs; linear `blend` differs from OKLCH interp; `maxChroma`/`isInGamut` agree with `displayable`; **brand-dark evaluates with zero errors and every named color's `.hex` matches the golden snapshot.**

## P2 — DSL extension for multi-model + conversions
**Goal:** the full language surface (view namespaces, cross-model args, array/index, perceptual equality) usable in the REPL.
**Tasks:**
- Wire view getters (`c.oklch`, `c.lab`, …) and namespaced accessors through the dispatch; verify chaining (`a.hsl.rotateHue(30).oklch.gamutMap()`) and that array-returning methods (`tintScale`, `triadic`) + indexing work end-to-end.
- Generate constructors/builtins from the manifest in `environment.ts`; add `deltaE` free fn and Oklab-default `mix`.
- Inspector learns the `ColorValue[]` case (swatch strip) and model-aware coord readout (`formatCoords`).
**Files:** `evaluator.ts`, `dsl/environment.ts`, `models/defs/*`, `components/Inspector.svelte`, `tests/evaluator.test.ts`.
**Acceptance gate:** worked examples A, B, D (above) evaluate with correct values and correct deps; `bun test` green; the inspector renders an array value as a swatch strip; an unknown view (`c.lba`) and an unbacked model (`c.cmyk`) throw clean, line-located errors without killing the rest of the REPL.

## P3 — Merge the display layer
**Goal:** the matrix/WCAG/CVD/previews consume the live DSL scheme via the adapter.
**Tasks:**
- Build `scheme/{types,adapter,roles}.ts` and the runes store `state/app.svelte.ts`.
- Port `analysis/{contrast,wcag,cvd}.ts` from `master:oklch.ts` (constants verbatim), re-typed against `ColorValue`.
- Port `Matrix.svelte` (+ detail/info dialogs), `Preview.svelte` (+ demos), `RoleMapper.svelte`, `AuditPanel.svelte`; replace master's static `import.meta.glob` scheme source with `scheme` from the store.
- Slim `routes/+page.svelte` into a shell with `TopBar`/`TabBar` + Author split + active analyze tab.
**Files:** `scheme/*`, `analysis/*`, `state/app.svelte.ts`, `components/{Matrix,Preview,RoleMapper,AuditPanel,TopBar,TabBar}.svelte`, `routes/+page.svelte`, `tests/analysis.test.ts`.
**Acceptance gate (the headline):** **rebuild `brand-dark` as a DSL script in the editor and render its contrast matrix** — the matrix, CVD select, both dialogs, role mapper, and audit all populate from the live `EvalResult`; `analysis.test.ts` reproduces master's contrast/levels/CVD values for the same colors; toggling a CVD mode and dragging fg-opacity update the matrix; editing the base color live re-themes the previews.

## P4 — Autocomplete + live preview polish
**Goal:** context-aware autocomplete + generated docs + inspector deps chips, all from the one manifest.
**Tasks:**
- Build `dsl/complete.ts` (context-aware completionSource) and wire `autocompletion` into `Editor.svelte`.
- Replace the docs overlay with `Docs.svelte` (manifest-generated, grouped by family/priority).
- Inspector deps chips (hover → highlight the depended-on entry); model-aware coord readout polish.
- Add `tests/manifest.test.ts` (anti-drift).
**Files:** `dsl/complete.ts`, `components/{Editor,Docs,Inspector}.svelte`, `dsl/manifest.ts`, `tests/manifest.test.ts`.
**Acceptance gate:** `manifest.test.ts` green (no manifest token without a runtime member, no runtime member missing from the highlighter); typing `base.` then `base.lab.` shows the right context-scoped menus with docs; docs overlay lists every registered model and dims `backed:false` ones.

## P5 — Save / share + export
**Goal:** persist and export schemes.
**Tasks:** `persistence/{url-hash,local-storage}.ts`; `export/{css-vars,tokens,tailwind,markdown}.ts`; `ExportPanel.svelte`; load-priority boot logic; Save/Share in `TopBar`.
**Files:** `persistence/*`, `export/*`, `components/ExportPanel.svelte`, `routes/+page.svelte`.
**Acceptance gate:** a share URL round-trips source+roles; named schemes save/load from `localStorage`; each export format copies valid output (CSS vars apply in a scratch page; Tailwind block parses; JSON validates against DTCG; markdown matches master's table). `bun test tests/export*` green.

## P6 — Dynamic Theme + more models
**Goal:** grow the model long-tail and the dynamic-theme capability behind the now-stable seams.
**Tasks:** add `defs/*` for deferred models as impls land (HCT `tonalPalette`/`materialRoles`, CMYK ink ops, HSLuv, CAM16, wide-gamut a98/rec2020/prophoto) — each a single data file, `backed:true` once polyfilled; explicit DSL roles (`role()`/reserved names) + `group()` convention; the [[Dynamic Theme]] feature; surface per-model special features in the UI (Lab ΔE between two selected swatches, OKLCH gamut-map preview, HWB white/black sliders); optional two-way swatch→source editing.
**Files:** `models/defs/*`, `scheme/{adapter,roles}.ts`, `components/*`, [[Dynamic Theme]] route.
**Acceptance gate:** adding a new `defs/*.ts` requires **zero** edits to evaluator/highlighter/autocomplete/docs (it appears everywhere automatically) — proven by a test that registers a dummy model and asserts it surfaces in the manifest; the [[Dynamic Theme]] demo recolors live from a single seed.

---

# 8. Risks, open questions, first step

## Risks & mitigations
- **View vs value coercion footgun.** A bare view (`x = c.hsl`) is not a `ColorValue`; passing it where a color is required would fail. *Mitigation:* `color()` coercion accepts a `ModelView` and unwraps to `.self`; steer users (docs + examples) to terminate views into a value/scalar. View getters re-enter the view system (`c.lab.oklch`) so chaining stays fluid.
- **OKLCH-canonical lossiness.** Round-tripping a value authored in HWB/Lab/P3 through OKLCH and back is not bit-exact; `c.hwb.hwb_w` after `HWB(h,w,b)` may drift slightly. *Mitigation:* acceptable for a theming tool; document that non-OKLCH coords are projections of an OKLCH source. (A multi-canonical store is the alternative if exactness is ever required — explicitly out of scope.)
- **Array values are real new work**, not "just a method": needs the `ColorValue[]` union, indexing, and inspector swatch-strip rendering. Gated together in P0/P2 so harmony/scale ops don't ship before they can render.
- **Registry drift** (a method on a model missing from the manifest still runs but won't autocomplete/highlight). *Mitigation:* `manifest.test.ts` reflects each model's methods and asserts manifest coverage.
- **Deferred models advertise capability they can't yet deliver.** *Mitigation:* `backed:false` flag → dim in autocomplete/docs; methods throw an actionable "needs @lilbunnyrabbit/chromatics" error, caught per-statement.
- **Model inference for the display readout is best-effort** (`Variable.node` heuristic). *Mitigation:* `'unknown'` falls back to OKLCH coords; never affects correctness (all math is canonical/culori).

## Open questions (link [[Open Questions]])
- **Q1 (engine):** confirmed lean C/A — wrap culori, add chromatics methods on demand. This plan commits to it (registry wraps culori; `backed:false` rows are the package boundary).
- **Q2 (repo home):** this plan assumes **consolidate into `color-testing`** (option A). Confirm before P1.
- **`mix` default space:** this plan picks **Oklab** (matches CSS `color-mix()`); today's `color.ts mix` is OKLCH shortest-arc. Reconcile in docs; keep an OKLCH `mix` reachable via `c.oklch`.
- **RGB channel range:** encyclopedia says `r/g/b` 0–255; today's `Color.r/g/b` are 0–1. Decide per-view `scale` (the `ChannelDef.scale` hook exists) and document consistently.
- **Explicit roles & grouping** (`role()`/`group()` vs name heuristics) — deferred to P6; design the `roleHint`/`SchemeGroup` hooks now.
- **APCA contrast** — no culori backing; needs `apca-w3` or a hand-roll (P6).

## The FIRST concrete step after /compact
**Implement P0's blocking fix and lock it with a test.** In `src/lib/dsl/evaluator.ts`, add the `ObjectExpression`, `ArrayExpression`, and computed array-index cases to the `evalNode` switch (before the `default` at line 253), widen `DSLValue` (line 7) with `ColorValue[]` and `PlainObject`, then write `tests/evaluator.test.ts` asserting that `shift({l:0.1})` / `derive({l:0.2})` (the currently-dead methods at `color.ts:139,149`) evaluate, that array literals + indexing work, and that dependency capture is unchanged. Add `"test": "bun test"` to `package.json`. This is the smallest, highest-leverage change, unblocks every options-object/array method the multi-model surface assumes, and establishes the bun-test gate everything else builds on.
