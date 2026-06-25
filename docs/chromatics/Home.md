---
tags: [moc, home, chromatics]
status: living
updated: 2026-06-24
---

# Chromatics — Home

> The second brain for **Chromatics**: a *Strudel-REPL for color*. You write JS-like code to declare color **variables and the relationships between them**, and the system reactively re-evaluates the whole scheme through a **dependency graph** — change one base color and the entire theme cascades. This vault preserves every idea, decision, and plan from the project's run as an npm package → color engine → DSL → unified app.

> [!tip] Start here
> - **What is this & why** → [[Vision]]
> - **How we got here** (npm template → engine → DSL → app) → [[Project History]]
> - **The current plan** (merge the DSL authoring app + the display/analysis app) → [[Unified Product Plan]]
> - **What's decided / still open** → [[Decision Log]] · [[Open Questions]]
> - **The genesis investigation** (2026-06-24) → [[Investigation Report]]

---

## 🗺️ Map of Content

### 00 · Overview
- [[Vision]] — the north star: relationships-as-code, the three layers, the dual audience, the "Dynamic Theme" goal.
- [[Project History]] — the dated evolution across both repos and all branches.
- [[Status & Inventory]] — every repo / branch / artifact and its verdict (keep · reference · retire).
- [[Glossary]] — every term, defined and linked.

### 01 · Decisions
- [[Decision Log]] — ADR-style record of every choice (decided · reversed · open).
- [[Build vs Buy]] — the deepest fork: wrap **culori** vs build the engine from scratch. *(Resolved: wrap.)*
- [[Architecture Decisions]] — OKLCH canonical, acorn parsing, the TypedArray reversal, channel naming.
- [[Open Questions]] — what's still undecided, with options and current leans.

### 02 · Knowledge (the distilled reference)
- [[Color Knowledge Hub]] — **master index** into the 113-note encyclopedia in `06-Reference/`.
- [[Color Models]] — the model taxonomy and which tiers actually matter.
- [[Color Science & Algorithms]] — conversion pipeline, gamut mapping, deltaE, harmony, interpolation.
- [[Accessibility]] — WCAG, APCA, CVD simulation, and how they power product features.
- [[Library Landscape]] — culori / colorjs.io / chroma.js / d3-color, with verdicts.
- [[Color Theory]] — foundational theory (harmony, perception, mixing).
- [[Brand Color Design]] — brand palette principles.
- [[Resources]] — the "where to learn more" hub: references, tools, libraries, papers.

### 03 · DSL
- [[DSL Spec]] — the **canonical, corrected** language spec (supersedes the old `DSL.md`).
- [[DSL Implementation Notes]] — how the working `test-dsl` implementation is built, file by file.
- [[DSL Gaps & Bugs]] — concrete defects (P0: `shift`/`derive` are dead) and fixes.

### 04 · Product
- [[Implementation Plan]] — 🛠️ **the active build blueprint** (chosen architecture + phased plan with acceptance gates). Start here to build.
- [[Unified Product Plan]] — **the centerpiece**: the DSL authoring app + the display/analysis app, joined.
- [[Feature Specs]] — per-feature specs: autocomplete, live preview, contrast matrix, CVD, real-example preview, save, export.
- [[Product Architecture]] — stack, module layout, and the data flow from source → scheme → surfaces.
- [[Roadmap]] — phased delivery with acceptance gates.
- [[Dynamic Theme]] — generate a full accessible theme from a few base colors.
- [[Existing Products]] — competitive landscape (Coolors, Adobe Color, Huemint…) and how Chromatics differs.
- [[Ideas Backlog]] — every collected feature idea, grouped by theme.

### 05 · Archive
- [[Investigation Report]] — the full 2026-06-24 investigation that seeded this vault.

### 06 · Reference (the encyclopedia)
The collected color knowledge, cleaned and organized — **every note has a Resources / learn-more section**. Browse via [[Color Knowledge Hub]].
- **Color Models** (73) — `06-Reference/Color Models/` — Hue · RGB · Perceptual · Video · Print · Other.
- **Color Systems** (29) — `06-Reference/Color Systems/` — Munsell, NCS, Pantone, RAL, and more.
- **Research** (11) — `06-Reference/Research/` — conversion pipeline, gamut mapping, harmony, interpolation, contrast, transfer functions…

> [!note] The `old/` dump is gone
> Its content was distilled into the structure above (per-model/system notes + the promoted knowledge notes). Your originals remain safe in your personal Obsidian vault.

---

## 📌 Status snapshot (2026-06-24)

> [!note] Where things actually stand
> - **The only working DSL** lives in `color-testing/test-dsl` — acorn evaluator + OKLCH `Color` on **culori** + CodeMirror REPL + dependency-tracking inspector.
> - **The display/analysis half** lives in `color-testing/master` — fg×bg contrast matrix, WCAG, 10-mode CVD simulation, and Landing/Dashboard/Blog real-example previews.
> - **The current goal** is to merge the two ([[Unified Product Plan]]).
> - **The from-scratch `chromatics` engine** (this repo's `dev`/`tmp` branches) is shelved as an optional learning track — culori wins for now ([[Build vs Buy]]).
> - **This vault** sits on the `the-final-decision` branch under `docs/chromatics/`.

*This is a living document. When you add or rename a note, update this map.*
