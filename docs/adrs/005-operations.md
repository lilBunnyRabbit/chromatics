# ADR-005: Operations

**Date:** 2026-10-18
**Status:** Accepted

> **Revision 2026-10-19: the operation set** ([brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 33–42)
>
> - **Families (internal, not exported):** rectangular, RGB (extends rectangular) and hue. Generic user code uses unions of the model classes.
> - **Adjust:**
>   - Methods: `lighten` / `darken` / `saturate` / `desaturate`.
>   - The amount is a fraction of the channel's reference range: `lighten(0.1)` is +0.1 in Oklch and +10 in Lab.
>   - On Oklch, Lch, Hsl (s, l), Hsv (s, v); lighten / darken only on Lab and Oklab; none on Hwb.
> - **Interpolation:**
>   - `mix(b, t)` requires t and extrapolates outside [0, 1].
>   - `steps(b, n)` returns n ≥ 2 colors, both ends included.
>   - `interpolator(b)` returns a function of t.
>   - `Model.gradient(stops, n)` is the multi-stop form.
>   - Hue models take `{ hue: 'shorter' | 'longer' | 'increasing' | 'decreasing' }`, default `shorter`.
>   - An achromatic end takes the other end's hue.
> - **Harmonies (hue models):**
>   - `rotateHue(deg)` and `complement()` mutate.
>   - `triadic()`, `tetradic()`, `square()`, `splitComplementary(angle = 30)` return arrays that start with a copy of the receiver.
>   - `analogous(angle = 30, count = 3)` is centred on the receiver.
> - **Ramp:**
>   - `ramp(n, { from = 0.05, to = 0.95 })` on Oklch, Lch, Lab, Oklab and Hsl.
>   - Lightness is evenly spaced as a fraction of the range; the receiver's hue and chroma are kept; steps are raw (no gamut mapping).
> - **Gamut (RGB classes):** `inGamut(tolerance = 7.5e-5)`, `clamp()`, `gamutMap({ method: 'css4' | 'clip' })`. The default is CSS Color 4 `#binsearch`.
> - **Metrics:**
>   - Srgb: `luminance()` and `contrast(other)` (WCAG 2.x).
>   - Lab: `deltaE76` and `deltaE2000`.
>   - Oklab: `deltaEOk` and `looksSame`.
>   - APCA waits on a license check.

## Context

Operations are methods on the color's class (ADR-001), and single-result operations mutate and return `this`. Open questions were: how shared operations reach ~100 classes, two-color operations across models, operations needing another model's math, multi-color results, interpolation, gamut mapping. The studio uses op-tables in `families.ts`; binary ops throw across models. [Brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 6, 7, 8, 12.

## Decision

- **Shared operations come from a shallow family base chain**: `Color → CylindricalColor | RectangularColor | RgbSpace … → model`, model-specific extras on the class. A model in two families gets the second family's operations by delegation.
- **Two-color operations are same-model by type**: `mix(other: this, t)`. Metrics too: `bg.to(Srgb).contrast(fg.to(Srgb))`, `a.to(Lab).deltaE2000(b.to(Lab))`, `a.to(Oklab).deltaEOk(b.to(Oklab))`. The working space is always visible at the call site.
- **Metrics live on the model whose math they are** (`Srgb.contrast`, `Lab.deltaE2000`, `Oklab.deltaEOk`). A method on `Color` that needs `Lab` would be a circular import and drag the Lab chain into every bundle.
- **Several results are new instances; the receiver is untouched**: `c.triadic()`, `c.ramp(11)`, `a.steps(b, n)`.
- **Interpolation:** `a.mix(b, t, opts)` mutates `a`; `a.steps(b, n, opts)` returns `T[]` including both ends; `a.interpolator(b, opts)` returns `(t) => T`; `Oklch.gradient([a, b, c], n)` for multiple stops. Alpha is premultiplied (CSS Color 4 §12.3). Hue strategy defaults to `shorter`, with `longer` / `increasing` / `decreasing` per call.
- **Gamut operations live on RGB-space classes** (`Srgb`, `DisplayP3`, `Rec2020`, …): `inGamut()`, `clamp()`, `gamutMap()` (CSS Color 4 §13), each mutating that color. `c.to(Srgb).gamutMap().to(Oklch)`.

## Alternatives Considered

1. Mixins: TS4094 blocks `private` / `protected` members in emitted `.d.ts`.
2. Explicit per-class methods over shared functions: most boilerplate.
3. Converting the argument into the receiver's model: `oklch.mix(lab)` vs `lab.mix(oklch)` differ invisibly.
4. A space option per call (`{ in: Oklab }`).
5. Metrics accepting any `Color`: the metric fixes its own space, so nothing would be hidden. The owner chose one rule for every two-color method.
6. Metrics on `Color`, loaded lazily or eagerly: lazy throws when a model isn't imported, eager ships every chain.
7. `oklch.gamutMap(Srgb)` staying in OKLCH: the owner kept the class-bound rule.
8. Straight alpha (today's studio): differs from browsers.

## Consequences

- Mutating and non-mutating methods coexist; the rule is "one result mutates, several are new".
- Two-color calls are longer (`fg.to(Srgb)`), in exchange for a visible working space.
- TS is structural, so the literal model tags (ADR-001) are what make `other: this` reject the wrong model.
