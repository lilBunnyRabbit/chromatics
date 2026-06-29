# Chromatics — Roadmap

Where this is going and why. This is a living plan, reprioritised as feedback lands.

## The thesis

**Define colors as relationships, not fixed hexes.** You make a few decisions once
(brand → accent → muted → surfaces → text), encode them, and the whole palette
re-derives when the source changes. Chromatics doesn't replace taste — it makes the
relationships **explicit, repeatable, and safe to change**.

Honest framing of the present: this is still more a **collection of ideas** for what
a complete color/scheme tool could be than a finished product. The plan is to keep
the studio as the idea board, harden the engine into a proper library, and let the
parts that prove useful graduate.

## Who it's for (sharpened by the first round of feedback)

The "is this useful to anyone but me?" question got a consistent answer from people who
aren't me:

- **Devs and design-system maintainers**, more than designers picking colors by eye.
  The value is _tokens that derive from each other_ — "change `brand`, the whole system
  updates safely" is a real workflow.
- **Taste still comes first.** The tool encodes decisions you've already made; it doesn't
  automate judgment. That framing is the positioning, not a caveat.
- A designer who independently built a color/token-relationship DSL flagged the studio as
  **impressive but overwhelming** ("why is `preview` on every line?"). Density is the #1
  friction to fix, and the relationship story has to land in the first 10 seconds.

So: lead with the small relationship example, aim the product at design-system tokens,
and reduce on-screen noise.

## Now — shipped this iteration

- [x] **Relationship-first default.** The Overview example is now ~24 lines: one brand
      color → accents → dark-mode surfaces → contrast-picked text → a preview block.
- [x] **Block scoping for every design surface.** `tokens { }`, `component { }`,
      `preview { }` (builder blocks — call primitives bare, no prefix) and `roles { }`
      (a `role = color` mapping block). Pure sugar — identical output, no prefix noise.
- [x] **Unified `tokens` namespace.** `scale.*` + `token()` joined under `tokens.*`
      (text/space/radius/shadow + custom groups); `scale.*` / `token()` kept as aliases.
- [x] **Discoverable templates.** The template picker was buried in the kebab menu; it's
      now a visible "Templates" button in the top bar.

## Next — make the first 10 seconds land, cut the friction

- [ ] **Onboarding to the thesis.** Welcome modal + first load lead with the 5-line
      relationship example; "edit `brand`, watch it cascade" as the hero interaction
      (highlight what changed on edit).
- [ ] **Block-aware editor.** Autocomplete and syntax highlight bare members inside a
      `preview {}` / `component {}` block (today they complete as plain identifiers).
- [ ] **Non-color tokens as relationships.** Spacing / radius / type scales derived from
      one base, the same way colors are — the design-system maintainer's daily surface.
      (Compare notes with the designer who's built this from the design side.)
- [ ] **Token export polish.** First-class DTCG, Tailwind theme, and CSS-vars output for
      a derived scheme — the format the dev/design-system audience actually consumes.
- [ ] **Trim the default surface.** Progressive disclosure of advanced tabs/features so a
      newcomer sees signal (relationships) before the firehose.

## Later — depth that matches the niche

- [ ] **Design-system mode as a first-class flow:** roles → light/dark theming →
      component audit, all driven from the editor, exportable as a real token set.
- [ ] **Scheme diff & versioning** — see exactly what a `brand` change does across the
      whole system; shareable and embeddable.
- [ ] **Custom models / plugins.** The registry is already data-driven; expose it so
      others can add a model or a token family without forking.
- [ ] **Visual ↔ code round-trip.** Keep code-first, but let lightweight visual tools
      write DSL back (the generator → `emit.ts` seam already does this for harmony/ramps).

## The library track (the "proper" foundation)

The color engine under `src/lib/models` is the durable core — immutable OKLCH-canonical
values, a data-driven model registry, culori behind a single seam. The plan:

- [ ] Extract it as a **standalone, documented, framework-agnostic package**
      (`@lilbunnyrabbit/chromatics`), with the studio as its first consumer.
- [ ] Stabilise the public API (constructors, channel/view access, ops, registry) and
      version it; the DSL manifest stays generated from the registry (no drift).
- [ ] Once the library is solid, **rebuild the studio on top of it** — the post's "I'll
      probably rebuild it on a proper library later" becomes this step, not a throwaway.

## Open questions

- **Does relationship-authoring help anyone but the author?** Early signal: yes, for devs
  and design-system tokens. Validate by shipping token-relationships and watching whether
  that crowd adopts it.
- **DSL vs. GUI.** Stay code-first (it was the only thing that actually modeled
  "use part of one color in another"), but a thin visual layer that emits DSL could widen
  the door for designers without forking into hidden GUI state.
- **How much scope is too much?** The studio is wide on purpose right now; the risk is it
  reads as overwhelming. Each tab needs to earn its place or move behind disclosure.
