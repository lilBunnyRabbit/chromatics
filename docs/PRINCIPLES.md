# Principles

Why Chromatics exists, what matters in it, and how decisions get made. Read this before writing code or proposing a design. [CONVENTIONS.md](CONVENTIONS.md) covers the _how_; this covers the _why_.

Claims here trace to the owner's words (quoted verbatim), the research vault (`docs/chromatics/`), or the git history. If one turns out to misread intent, fix it here.

---

## What this is

Two things, being pulled apart into a monorepo:

1. **A color library**, published to npm. Our own engine, replacing the culori wrapper in `src/lib/models/`. This is the current focus.
2. **The studio**: the scriptable color DSL and the analysis UI at `lilbunnyrabbit.github.io/chromatics`. The library's first and most demanding consumer.

It's a solo project. No contributors to optimise for, but the package has users the owner will never meet, so its public API and its numbers have to be right without anyone asking.

## What matters most

**The API.** The owner, 2026-10-18: _"Big factor is the api we decide on. I want to be 200% involved and to my liking. most important thing!"_

**Correctness, proven by tests.** _"This needs to be bulletproof with really in depth tests of every model boundries, conversions, everything."_

**Breadth.** _"I want to support EVERY COLOR MODEL AND SCHEME (not the copywrighted like panetone)."_

For anyone working on the code:

- **Agents never make architectural decisions.** The owner does, every time. Rules and the "what counts" list: [CLAUDE.md](../CLAUDE.md#architecture-is-the-owners-call-always).
- A model that ships without its full test matrix is not shipped.
- A number in a test that nobody can trace to a source is not a test.

---

## Lessons from the earlier attempts

The library was hand-written four times (2024 → 2026-03) before the project pivoted to wrapping culori. The full history is in [Library Investigation](chromatics/04-Product/Library%20Investigation.md). What killed each attempt is the strongest guide we have:

| What happened | Rule it gives |
|---|---|
| Zero real tests in every generation; the only test was the template's broken `getHello` | Tests are written with the model, not after. See CLAUDE.md, _Numbers need sources_ |
| Math drafted by AI and never checked (`// TODO: AI generated, needs check`, `// TODO: Check AI`) | Every formula cites a spec or paper; every expected value comes from an independent source |
| Typed-array subclasses: Float32 drift over long chains, byte rounding on every construct, `map()` calling the subclass constructor | Storage and precision are explicit decisions, recorded in an ADR |
| Clamping setters destroyed out-of-gamut values; hue clamped instead of wrapped; RGB silently divided by its max | Never lose data silently. Out-of-range is a policy, decided once |
| Side-effect registration broke tree-shaking (and later crashed the prod build: the `sideEffects: ["**/models/**"]` gotcha) | How models plug in is a decision, tested against a real bundler |
| `from()` looked up the reversed edge and nobody noticed | Every conversion is tested in both directions |
| Four rewrites in 13 months, about 12 of 60 models built | Decide the shape once, with the owner, then build breadth on it |

## How decisions get made

### 1. Correct beats convenient

A conversion that's off in the fourth decimal is a bug, even if the hex matches. Culori did a lot silently (undefined hue on greys, missing alpha means opaque, XYZ scaled Y=1, one hop through RGB). Each of those becomes an explicit, documented, tested decision in our engine.

### 2. Exact over search

On `ensureContrast`, the owner called the iterative solver _"hacky, only for testing"_ and replaced it with closed-form math (_"a ratio target inverts with one division, and `.xyy.setLuminance(Y)` lands it exactly"_). When an exact inverse exists, the library offers it. Iteration is the fallback, and it says so.

### 3. Sources over memory

Formulas come from CSS Color 4/5, CIE publications, ITU/SMPTE recommendations, and the original papers. Reference values come from independent implementations (colour-science, colorjs.io, the spec's own examples). Never from the code under test, never from a model's recall.

### 4. Every model, no proprietary data

Breadth is a goal, not scope creep. Systems whose data is licensed (Pantone) are out. Where licensing is unclear (NCS, RAL), it's a per-system decision with the owner.

### 5. Infrastructure has to earn its place

Name the concrete thing that breaks today without it. "We'll need it later" is speculation and gets said out loud.

### 6. The owner's taste is a valid reason

Naming, API feel, how a call reads. Settled decisions aren't reopened in passing; reopen one with new evidence, as a brainstorm, explicitly.

---

## How the owner works with an agent

- **Explain the mechanism, not the benefits.** Show the call path, the math, the bundle.
- **Lay out options, then recommend.** For each lighter option you reject, say what breaks.
- **Answer every part of a multi-part question.**
- **Push back.** If a request or an ADR looks wrong once it meets the code or the spec, say so with evidence.
- **No AI slop.** No boilerplate docs, emoji headings, fake timelines, speculative multi-phase plans, or comments that restate code.

## The process

```
idea → brainstorm log → ADR → ROADMAP item → code + tests → ROADMAP + ADR status updated
```

| Artifact | Holds | Lives in |
|---|---|---|
| Brainstorm | The discussion: options, back-and-forth, dropped ideas | `docs/brainstorm/YYYY-MM-DD-topic.md` |
| ADR | The decision, alternatives, consequences | `docs/adrs/NNN-title.md` |
| Roadmap | What's done, what's next | `docs/ROADMAP.md` |
| Research vault | Color science, model encyclopedia, the studio's earlier decisions (`CD-NN`) | `docs/chromatics/` (Obsidian) |

The vault's Decision Log (`CD-01`…) records the studio-era decisions and stays as history. New decisions are ADRs. An ADR that overturns a `CD-NN` says so in its Context.
