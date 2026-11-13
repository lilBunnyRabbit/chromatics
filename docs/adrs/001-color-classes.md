# ADR-001: Color classes, storage, mutability

**Date:** 2026-10-18
**Status:** Implemented

> **Revision 2026-10-26 (ADR-018):** the DSL is no longer an adapter in the app: its headless layers are `@lilbunnyrabbit/chromatics-dsl`, with the color package as a peer. The color package still doesn't bend for it; `Srgb.ensureContrast` moved in as a color operation.

> **Revision 2026-10-19** ([brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 18, 19)
>
> - **Channels are accessors over private backing fields**, not plain fields, so a write can validate (ADR-003: throw on `NaN` / `Infinity`, wrap hue). Measured cost over 10M read+write ops: plain fields 25 ms on V8 and 60 ms on JSC, accessors 100 ms and 250 ms. Accepted by the owner; a batch type can win it back. `toJSON()` returns `{ model, ...channels, alpha }`.
> - **Static channel metadata, keyed by name:** `static readonly channels = { l: { range: [0, 1] }, c: { range: [0, 0.4] }, h: { range: [0, 360], hue: true } } as const`. Key order is the constructor and `coords` order. `range` is the CSS reference range, never enforced.

## Context

The studio's `ColorValue` (`src/lib/models/value.ts`) is one tagged class whose channels resolve at runtime through `member()`, so they aren't on the TS type (46 `.channel()` call sites, ~164 casts). The vault's Implementation Plan §0 rejected class-per-model because typing "is irrelevant in a dynamically-typed DSL"; for a TS package that premise is false. The owner's 2024–26 libraries extended typed arrays; [brainstorm](../brainstorm/2026-10-18-own-color-library.md) grills 1, 2, 14.

## Decision

- **One class per model**, all extending an abstract `Color`. `parse()` returns `Color`; `c.is(Lab)` narrows by comparing model tags (`this.model === M.id`), not `instanceof`.
- **Library users first.** The DSL is an adapter in the app; the package doesn't bend for it.
- **Everything is bound to the color's own class.** No cross-model views (`c.hsl.l`, `c.oklch.lighten()`); another model's channel is `c.to(Hsl).l`.
- **Storage: plain number fields**, plus a static channel list and a `coords` getter for generic math.
- **Mutable.** Setters write in place; `clone()` copies.
- **Single-result operations mutate the receiver and return `this`** (`c.lighten(0.1).rotateHue(30)`).
- **Construction:** positional with alpha last (`new Oklch(0.7, 0.15, 30, 0.5)`), object form `Oklch.of({ l, c, h, alpha? })`.
- Each class declares a literal model tag so structurally identical classes (`Lab` / `Oklab`, `Srgb` / `LinearSrgb` / `DisplayP3`) stay distinct to the type checker.
- Custom user models are not public in v1.

## Alternatives Considered

1. Plain objects + free functions (culori style): best tree-shaking, no methods or chaining.
2. Tagged generic `Color<M>`: one class, generic-heavy errors.
3. Typed classes plus a separate dynamic wrapper: two surfaces to keep in sync.
4. Typed-array storage. Measured on 1M colors: plain fields 59 ms / ~112 B per color / 40 ms convert on V8 and 20 ms / ~56 B / 31 ms on JSC; private `Float64Array` 140 ms / ~288 B / 55 ms and 25 ms / ~136 B / 36 ms; `extends Float64Array` 126 ms / ~256 B / 51 ms and 41 ms / ~88 B / 41 ms. A typed array is two heap objects. Extending one also clashes with the `Color` base (single inheritance), lets index writes bypass setters, and loses the class through `JSON` / `structuredClone`. The typed-array win is bulk (one shared buffer: 32 B, 5 ms); a batch type may come later.
5. Immutable + `with()`: rejected by the owner in favour of mutable colors.

## Consequences

- Channels are typed; the cast problem goes away.
- Unused methods ship with their class.
- Conversion results can't be cached on an instance without invalidation.
- The DSL adapter must `clone()` at its boundary to keep dependency tracking sound.
- Two copies of the package make `is()` true across classes from different versions.
