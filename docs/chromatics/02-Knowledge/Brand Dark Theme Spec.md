---
tags: [knowledge, brand, spec]
status: living
updated: 2026-09-17
---

# Brand Dark — Theme Spec

The finished two-mode theme for **lilBunnyRabbit**, derived from one seed. Supersedes the
hand-derived palette in [[Brand Color Design]] (same seed, hand-tuned instead of solved).
Theory in [[Color Theory]], contrast rules in [[Accessibility]], model in [[Oklch]].

> [!info] Scope
> **Dark is the brand.** The logo, the marketing and the identity all live there. **Light
> exists so the product can render a light UI** — defined to the same standard, not intended
> as identity. Light is fitted to its own ground rather than inheriting dark's hues; see
> *Light is not a hue swap* below.
>
> 2026-09: the dark ladder's reach is now solved by arithmetic instead of a grid search
> (see *Dark*). Seed, brand and state hexes are byte-identical; the six shades and
> `cottontail` moved by one hex unit. Everything that identifies the brand is unchanged.

## The one rule

**Chroma tracks the gamut.** Hold chroma at a constant fraction of the sRGB boundary at each
lightness: `C = tint · maxChroma(L, hue)`, `tint = seed.C / maxChroma(seed.L, seed.H)` = **0.456**.

Below the cusp this is exactly `C = seed.C · L / seed.L`, which is the form the dark ladder
uses. It replaced an 18-variant `sat`/`flat`/`desat` study: those columns were two halves of
this one curve, matching `k · maxChroma` to four decimals, and `bg_darkest_sat` was the only
colour in the old file outside sRGB.

Above the cusp — where the light page sits — the two forms part company, and only the gamut
form survives: proportional chroma stays nearly flat near white (the light shades blended),
while the boundary collapses to zero at L 1. The light ladder therefore uses the rule as
written, not its below-cusp shortcut.

## The contract

The text is legible (AA, 4.5:1) on every shade. Brand and state colours are legible on the
page and the surface, and clear WCAG's 3:1 non-text floor on every shade below that.

Dark meets the stronger form — every colour on every shade — for free, because every dark
colour sits at the text's lightness and the ladder is solved against the dimmest of them.
Paper cannot: at the text's lightness (L 0.40) the sRGB gamut is about half as wide as at
dark's 0.745, and holding the whole contract there turned every light brand colour brown,
grey or olive. So on paper the contract splits by role, and the text, the brand and the
ladder are each solved for their own part of it. See *The contract splits on paper*.

Every solve in the file targets one number, `legible = 4.55`: AA plus 0.05, which is what the
rungs' own chroma and the 8-bit rounding of the shipped hexes cost between the solve and the
screen (measured, at most 0.02 in either mode).

## The palette — 17 tokens, each with a `light_` twin

| dark | | light | |
|---|---|---|---|
| `background` | `#17252c` | `light_background` | `#f6eddb` |
| `background_lightest` | `#2a404a` | `light_background_lightest` | `#ffffff` |
| `background_lighter` | `#243740` | `light_background_lighter` | `#fcf9f3` |
| `background_light` | `#1d2e36` | `light_background_light` | `#f9f3e7` |
| `background_dark` | `#111d23` | `light_background_dark` | `#ebd9b1` |
| `background_darker` | `#0b1519` | `light_background_darker` | `#dec58e` |
| `background_darkest` | `#060d11` | `light_background_darkest` | `#cab380` |
| `foreground` | `#b1aba8` | `light_foreground` | `#414754` |
| `primary` | `#a4b483` | `light_primary` | `#7f4e32` |
| `secondary` | `#b2a6c5` | `light_secondary` | `#376662` |
| `tertiary` | `#9eb1ac` | `light_tertiary` | `#5f5968` |
| `accent` | `#dc9b76` | `light_accent` | `#814370` |
| `success` | `#7ac26a` | `light_success` | `#1c6f00` |
| `warning` | `#e49b39` | `light_warning` | `#5d6200` |
| `error` | `#f88876` | `light_error` | `#a12c1f` |
| `info` | `#49b7fb` | `light_info` | `#0063a0` |
| `cottontail` | `#e3f9b2` | `light_cottontail` | `#9c4800` |

The mark's ears are `cottontail` in **both** modes — a fixed asset colour, not a twin (there
was a `mark_ears` alias for this; it was one name for a colour that already had one). There is
**no border colour token**: the `border` role maps to a shade, and component borders are
`fg/67`, the lowest alpha clearing 3:1 on every shade.

## Dark — what is derived, and why it is not a choice

| quantity | rule | why |
|---|---|---|
| `dimmest` | `min(…)` of the nine colours' `srgb.luminance` | the hardest text on a dark ground is the colour carrying the least luminance — `error`, as it happens, but asked for, not assumed |
| ladder reach `span` = 0.102 | `background.xyy.setLuminance((dimmest + 0.05) / legible − 0.05).ok_l − background.l` | WCAG contrast is `(Yl + 0.05) / (Yd + 0.05)`, so a ratio target inverts into a luminance target with one division, and `xyy.setLuminance` lands a colour on that luminance exactly — Y in xyY *is* the WCAG luminance. The lightest shade is the seed lifted to where the dimmest text still reads `legible`. Was `ensureContrast` on a 0.005 grid, which stopped at 0.100 and read 4.59; the exact answer is 0.102 and reads 4.55. The hand-tuned 0.11 was eight thousandths over. |
| rung chroma | `bg.c · L / bg.l`, written as `shift({ l, c })` off the seed | the one rule. Expanded, `c · L / bg.l` = `c + span_c`, so the ladder is additive and the seed is literally its middle rung. |
| brand chroma | integer multiples of the seed chroma — 1c 2c 3c 4c, states 6c | the scheme already said `primary = 3c` and `states = 6c`, so `c` was already the quantum. With primary pinned at 3 there are exactly two rungs beneath it, and exactly two quieter siblings. 5c is empty so the brand band and the state band stay apart. |
| brand hue | ≥45° from the neutral, ≥45° from other brand hues | leaves two legal arcs, 167.5–185 and 347.5–5.5. States are conventions and sit where culture put them; the nearest brand/state pair is 17.5° (`primary`/`success`), and it is chroma rank — 3c against 6c — that keeps them apart, not angle. An earlier draft claimed a ≥25° state rule; the file never met it and never needed to. |
| `tertiary` = `(primary.h + background.h) / 2` | the midpoint of the 167.5–185 arc | the arc's edges ARE the two 45° constraints, so its centre is the point furthest from both. Was `primary − 120`, the only legal triad partner — but at 1c that put rank 1 only 7.2 ΔE from `foreground`, against `secondary`'s 14.7. Now 11.9. |
| `top` = 0.949 | `foreground.l + span · 2` | the top of the dark system; `cottontail` sits on it and the light page is built on it |
| `cottontail` | `primary` at `top`, chroma 60% of the ceiling | must clear L 0.94 or the logo ears stop reading on the disc. Contrast on the page is flat from 60% to 92% of the ceiling (13.7–13.8), so the fraction is a look decision and 60% keeps headroom if the seed moves. |

**Verified: all 63 colour × shade pairs clear AA.** Worst 4.55 continuous, 4.54 on the shipped
8-bit hexes (`error` on `background_lightest`). Body 6.92.

## Light is not a hue swap

Reusing dark's hues fails, and it is measurable. Carry the page hue down the ladder rule to the
brand's lightness — the page's own darkened form — and measure each candidate against it: a
green primary on dark's hue sits **12.8 ΔE** from it, close enough to read as a shade of the
paper rather than a colour on it; the orange **14.2**. Orange is also the seed's complement.
The measurement and the relationship agree, so there was never anything left to pick.

The page hue itself is the midpoint of the two hues dark is built around — the text's (which
is also `accent`'s) and `primary`'s, the only two candidates for a light primary on a warm
ground. At the midpoint the page is 36° from each, the furthest a hue between them can be
from both. An earlier draft read the midpoint (86.47) as too yellow and pinned the page at a
literal 80 lifted from an old asset; the literal is gone, and with it the last chosen hue in
the light half.

### Derived from dark

| quantity | rule |
|---|---|
| `top` = 0.949 | `foreground.l + span · 2` — the top of the dark system, and the light page's lightness |
| page hue `light_bh` = 86.47 | `(foreground.h + primary.h) / 2` |
| page chroma | the same 45.6% gamut fraction (`tint`) the dark seed sits at |
| `light_foreground` | on the page's complement, at exactly the luminance an **8:1 body** demands — `setLuminance((page.Y + 0.05) / 8 − 0.05)`, chroma the seed's. Past AAA with margin, and darker than dark's inherited 6.92 on purpose: the text alone sizes the ladder, so its body ratio is also the depth. |
| quantum `light_u` = 0.0259 | `light_background.c` — dark's quantum is its seed's chroma; light's seed is the page. Was 55% of primary's ceiling over 3, a literal, and circular once the brand lightness became a solve. |
| brand lightness `light_bl` = 0.474 | solved against the surface, see *The contract splits on paper* |
| `light_primary` hue = 50.47 | `foreground.h` — the seed's complement, the angle dark's own `accent` sits on |
| `light_accent` | `foreground.h − 72` — dark's own offset, on the other side |
| `light_tertiary` hue = 302.47 | `(light_foreground.h + light_accent.h) / 2` — the midpoint of the text and accent hues, 36° from each: dark's "furthest from both walls" rule, in the one arc a warm page leaves open. Rank 1. |
| `light_secondary` hue = 190 | `(h_success + h_info) / 2` — `primary + 180` lands on `info` (the complement of orange **is** blue), so secondary takes the centre of the legal teal arc instead, 50° from each state it must clear |
| `light_warning` hue = 113.2 | `(light_bh + h_success) / 2` — dark's 70 sits 16° off the page. The midpoint of the page and `success` clears both by 26.8°; a green-gold, forced rather than chosen |

> [!note] A literal pretending to be a choice
> The light primary hue shipped for a release as `50.47` under the heading *chosen, per the ΔE
> measurement*. It is exactly `(bg_h + 180) % 360` — the seed's complement — to 2.8e-14, which
> is `% 360` float noise and nothing else. The ΔE argument was not wrong; it asked for orange
> and the complement **is** orange here. Same for `190` and `110`, both midpoints of hues
> already in the file, and later for the page hue `80` itself. Substituting the first three
> moved not one hex.
>
> The general shape: a number that is *justified* still reads as chosen, and prose justifying it
> makes it harder to notice, not easier. The tell was arithmetic, not argument.

### The contract splits on paper

With the whole contract — every colour AA on every shade — the light brand had to sit at the
text's lightness, L 0.40, where the sRGB ceiling on the orange hue is 0.104 against the 0.140
dark's states use at 0.745. Everything came out brown, grey or olive, and the rank-1 tertiary
measured 3.7 ΔE from the text: the text in a different coat. Dark pays nothing for the same
contract because L 0.745 is where saturated colour lives.

So on paper the contract splits by role:

| part | who | where | solved by |
|---|---|---|---|
| text | `light_foreground` | AA on every shade | the ladder descends until the text reads `legible` — `light_span` |
| brand + states | 8 colours | AA on the page and the surface, ≥3:1 on every shade below | the brand sits where its loudest colour reads `legible` on `light_background_dark` — `light_bl` |

The brand solve runs twice because luminance depends on hue. `light_nl` is where a colour on
the page's own chromaticity reads `legible` on the surface — where a neutral would sit (0.488).
Green carries more luminance per unit of lightness than any hue (`h_success` = 140 is the sRGB
green primary's own angle), so a rank-6 green is the loudest thing in the set; `light_bl`
reruns the solve on that probe, placed at the neutral's answer so its chroma survives the
rescale (0.474; a further iteration moves it 0.0003). Everything colourful shares that lightness.

The cost is exact and stated: a brand colour as *small text* on the two deepest rungs is not AA
(3.09 on the darkest). Everything else improved — tertiary 9.5 ΔE from the text, primary 13.4
from error, states that look like states.

Two consequences worth knowing. `light_warning` (113°) and `light_info` (240°) sit above the
sRGB ceiling at rank 6, so for those two rank 6 means the ceiling: `gamutMap` holds lightness
and hue and gives up the chroma that does not fit (68% and 80% of the rank). And
`light_cottontail` is boxed — see *`cottontail` and its light twin*.

### The ladder: one rule, two reaches, the page in the middle

Every light rung holds the seed's gamut fraction `tint` of the chroma available **at its own
lightness**, `OKLCH(L, maxChroma(L, light_bh) · tint, light_bh)`, and the page is that formula's
middle rung — exactly as the seed is dark's. Neither reach is chosen.

| reach | rule | value |
|---|---|---|
| up `light_up` | `1 − top` | 0.051. The limit is a wall, not the contract: white, where `maxChroma` is zero, so the top rung comes out tintless without being special-cased. |
| down `light_span` | `top − page.xyy.setLuminance(legible · (text.Y + 0.05) − 0.05).ok_l` | 0.175. The limit is the contract — the mirror of dark's `span`, multiply where dark divides because the page is the lighter side. |

ΔE from the page: **8.82 · 5.66 · 2.73 · 0 · 8.29 · 14.12 · 16.95**. Steps 3.2 · 2.9 · 2.7 above,
8.3 · 6.1 · 4.9 below, widest over narrowest 3.0. Asymmetric, and honestly so: the page sits
5% below white, so the only depth a light ladder can have is below it, bought with wider
strides. The three rungs above the page divide 8.8 ΔE between them, which is industry-normal
near white (Tailwind's stone-50 → 100 → 200 step about 2 and 6) and reads as one colour in a
swatch strip and as "white card on cream page" in a layout.

> [!note] White is the top rung now, and why that used to be a bug
> An earlier ladder held the page chroma **flat** going up and gamut-mapped each rung. At L 1.0
> the sRGB ceiling is zero, so the map stripped the whole tint at once and the top rung came out
> `#ffffff` with a ΔE of 8.26 to the page against 2.59 for the next rung — a chroma **cliff**,
> not a lightness step. The fix at the time was to stop below the ceiling (`light_up` = 0.029,
> found by probing the boundary's slope). The current ladder holds the gamut *fraction* instead,
> so chroma tapers to zero continuously, white is the limit rather than a hole, and the three
> steps measure 3.2 · 2.9 · 2.7. Same hex at the top, no cliff. The old `light_up` name survives
> with a new meaning: the up reach, `1 − top`.

## Findings worth keeping

**The hardest hue flips with polarity.** On the dark page the dimmest colour (`error`) binds
the ladder; on a light page the brightest one (`success`) binds the brand. Solving the light
span against dark's worst case once left seven of nine light colours under AA. Both halves now
ask which colour binds — `dimmest` by `min`, the green probe by construction — instead of
assuming it.

**Paper themes hold chroma constant and put the page at the top.** Solarized `#fdf6e3`→`#eee8d5`
is .0261→.0260; Gruvbox `#fbf1c7`→`#ebdbb2` is .0555→.0566. Neither palette contains white.
This finding drove one release, then was superseded: holding chroma flat is exactly what made
the light shades blend (the ceiling nearly triples between the page and the darkest rung, so a
flat tint is a *shrinking* fraction of it). The gamut-fraction rule keeps the finding's point —
the page is the top of a tinted system — and gives up its arithmetic.

**Comfort tracks chroma, not contrast.** Across a chroma row at fixed lightness the contrast
moves 0.08 (5.21 → 5.27) while the colour goes from muted to harsh. Every "hard to look at"
reaction in testing was saturation, and every "muddy" one was a colour sitting at a low
fraction of its own ceiling. This is the observation behind the split contract: at L 0.40 rank 1
cannot be anything but muddy, and no hue fixes it.

**A "green dead zone" I claimed does not exist.** An earlier pass concluded green could not
hold chroma on a light ground. That was `ensureContrast` walking lightness before chroma and
returning the nearest match — an analytic scan shows green reaches C 0.1122 at 4.5:1, 1.6×
what it needs. The fix was dropping the solver, not the hue. `ensureContrast` is now out of
the derivation in both modes; the same inversion (`xyy.setLuminance`) does every solve exactly.

**Brand lightness trades against ladder depth — under the whole contract.** With every colour
on every shade, a brand at L 0.50 capped the deepest rung at L 0.925 (ΔE 0.35 from the page, no
visible panels) and L 0.425 bought a 0.125 span. The choice then was to keep the contract and
darken the brand. The split contract dissolves the trade: the brand sits at 0.474 *and* the
deepest rung at 0.774, because the ladder now answers to the text alone.

## The mark

Pale ears on a green disc. The **ears are a fixed asset colour** — `cottontail` itself, in both
modes; only the disc themes.

```
dark    #e3f9b2 on #a4b483    1.96   greyscale 1.95
light   #e3f9b2 on #7f4e32    6.08   greyscale 6.35
```

1.96 is a logo allowance — WCAG exempts logotypes — and it holds because the difference is
*lightness*, not hue, so the mark survives greyscale and all three CVD types within 0.1 of the
normal-vision value.

**Do not derive the light ears from `light_primary`.** Dark's "two spans above the disc" is an
accident of `primary` sitting at L 0.745; the same offset from a light primary lands in the
mid-tones and the ears go muddy on the disc. The fixed colour reads 6.08.

## `cottontail` and its light twin do different jobs

`cottontail` is the brightest thing in the dark system: logo detail, display text, focus
rings, 13.80 on the page.

`light_cottontail` **pops by chroma, not lightness**. On a light page the "further from the
page" route lands beside the foreground, where it reads as ordinary dark text no matter what
ΔE says. So the twin goes to the full gamut ceiling, two up-strides above the text — the same
offset dark's `top` takes from its own text. The up stride, not the solved one: two solved
spans would lift it past the page's non-text floor (2.26:1, a focus ring that fails 1.4.11).
Here it clears 3:1 on every rung (3.07 on the darkest) and reads AA on the page (5.40): a
focus ring, a marker, a chart highlight. **Not display text**; use `light_primary` for that.
Not an identity colour either.

It is boxed since the contract split: the brand sits 0.03 of lightness below it and the
darkest rung's 3:1 floor just above, so it is `light_primary`'s louder twin — same hue,
9.9 ΔE, 1.10 between them — rather than a colour of its own. A cottontail ring *on* a primary
button will not read; it never did (1.50 before). Making it its own colour means shrinking
its contract to page and surface, which was offered and declined.

## Open items

- **APCA.** `foreground` is Lc 54.7, under the 60 body bar. WCAG says 6.92, comfortably AA —
  this is the polarity blindness WCAG 2 has for light-on-dark. L 0.78 would clear it but costs
  the clean `1 − bl` inversion.
- **`light_warning` is green-gold** `#5d6200`. It clears every constraint but fights
  convention, and at rank 6 it is the ceiling on its hue. Worth checking in a real alert rather
  than a swatch. At L 0.47 no amber exists; an amber warning on paper would have to be a fill,
  not a text colour.
- **`light_cottontail` follows the orange primary** `#9c4800`, so dark and light "cottontail"
  share only a name, not a hue — and it is now primary's louder twin, see above.
- **The `/brand` page and the studio example** (`src/routes/examples/brand-dark.ts`, dark-only,
  pinned to `tests/fixtures/brand-dark.ts`) still carry the pre-2026-09 dark hexes. Next.

## Bugs this work surfaced in the app

- **`contrastRatioAlpha` blends in linear RGB.** Browsers composite CSS alpha in gamma sRGB,
  and `resolveRef` emits `color-mix(in srgb, …)`. Four of six alpha pairs flip WCAG band, and
  the error over-reports light-on-dark — the common case in a dark theme.
- **`tokensFromScheme` silently drops unknown `token()` families** (`if (!(fam in t)) continue`),
  so `token("opacity", …)` produces no CSS var, no ref and no error.
- **The two audits disagree** on disabled/border pairs — `roles.ts` grades at the normal band,
  `components.ts` at the large band via the `large` flag.
- **`resolveColor` strips alpha modifiers**, so a translucent *background* cannot be audited:
  `error on error/15` scores 1.00 instead of ~5.
- **Preview names clobber same-named variables.** A `preview { x = pair(…) }` entry becomes a
  top-level `x`, silently replacing a number defined earlier under that name. Cost one round
  of a review file.

## Source

```js
// ── Brand Dark — one seed, two modes, one contract ──
//
// 17 colors per mode: 7 background shades, 1 foreground, 4 brand, 4 states,
// 1 identity. A background is a SHADE, not a role.
//
// The contract: the text is legible on every shade; brand and state colors are
// legible on the page and the surface, and clear WCAG's 3:1 non-text floor on
// every shade below. Dark meets the stronger form for free — every color sits
// at the text's lightness and the ladder is solved against the dimmest of them.
// Paper cannot (see the light half), so there the text, the brand and the
// ladder are each solved for their own part. Every reach is solved, never
// chosen: dark's above the seed (`span`), light's below the page
// (`light_span`), by the same arithmetic. Light's other direction meets a wall
// before it meets the contract — the ladder runs out at white.
// Everything else is a relationship to the seed.
//
// Channels read off the color itself — `background.l` is OKLCH lightness
// because the color IS OKLCH — so every line names the color it depends on.
//
// Verified on the shipped 8-bit hexes. Dark: all 63 color × shade pairs clear
// AA, worst 4.54. Light: text on all 7 shades, worst 4.56; brand on page and
// surface, worst 4.54; every colored cell above 3:1, worst 3.09.

// ── Seed — the only literal color ──
background = OKLCH(0.255, 0.0233, 230.47)
foreground = OKLCH(1 - background.l, background.c / 3, (background.h + 180) % 360)

// ── Brand — hue is identity, chroma is rank ──
// Hue law: every brand hue sits ≥45° from the neutral and from every other
// brand hue, or it reads as a lit shade of its neighbour. With the neutral at
// 230 that leaves two legal arcs, 167.5–185 and 347.5–5.5. States are
// conventions and sit where culture put them; the nearest brand/state pair is
// 17.5° (primary/success), kept apart by chroma rank — 3c against 6c — not
// by angle.
//
// tertiary is the midpoint of the wide empty arc, the point furthest from both
// of its 45° walls, so it is derived, not picked. It used to be primary − 120:
// a dusty rose 7.2 ΔE from the body text, too close to read as a color, too
// odd not to catch the eye. The midpoint reads 11.9.
//
// Chroma: the seed's chroma is the quantum. primary is rank 3, which forces two
// quieter siblings and one louder. 5c stays empty so the brand band (1–4c) and
// the state band (6c) never touch.
primary   = OKLCH(foreground.l, background.c * 3, (foreground.h + 72) % 360)
secondary = OKLCH(foreground.l, background.c * 2, (primary.h + 180) % 360)
tertiary  = OKLCH(foreground.l, background.c,     (primary.h + background.h) / 2)
accent    = OKLCH(foreground.l, background.c * 4, foreground.h)

// ── States — cultural hues at the top of the chroma ladder ──
// The one place a hue is a convention rather than a relationship, so they are
// named: both modes reference them, and light derives two more hues from them.
h_success = 140
h_warning = 70
h_error   = 30
h_info    = 240

success = OKLCH(foreground.l, background.c * 6, h_success)
warning = OKLCH(foreground.l, background.c * 6, h_warning)
error   = OKLCH(foreground.l, background.c * 6, h_error)
info    = OKLCH(foreground.l, background.c * 6, h_info)

// ── The contract, as a number ──
// AA is 4.5. The 0.05 on top covers what the rungs' own chroma and the 8-bit
// rounding of the shipped hexes cost between the solve and the screen —
// measured, at most 0.02 in either mode. Every solve in the file targets it.
legible = 4.55

// ── Dark ladder reach — SOLVED ──
// WCAG contrast is a ratio of relative luminances, (Yl + 0.05) / (Yd + 0.05),
// so a contrast target inverts into a luminance target with one division, and
// `xyy.setLuminance` puts a color on that luminance exactly — Y in xyY IS the
// WCAG luminance. The hardest text is whichever color carries the least
// luminance (error, as it happens, but asked for, not assumed); the lightest
// rung is the seed lifted to where that text still reads `legible`. Move the
// seed and this re-solves.
dimmest = min(
  foreground.srgb.luminance, primary.srgb.luminance,   secondary.srgb.luminance,
  tertiary.srgb.luminance,   accent.srgb.luminance,    success.srgb.luminance,
  warning.srgb.luminance,    error.srgb.luminance,     info.srgb.luminance
)
span = background.xyy.setLuminance((dimmest + 0.05) / legible - 0.05).ok_l - background.l

// ── Dark ladder — chroma moves in proportion to lightness ──
// Below the gamut cusp that is identical to holding chroma at a fixed fraction
// of the sRGB boundary (they agree to 4 decimals). Lighter shades gain color,
// darker ones lose it, nothing leaves gamut. The seed is the middle rung.
span_c = background.c * span / background.l

background_lightest = background.shift({ l:  span,       c:  span_c })
background_lighter  = background.shift({ l:  span * 2/3, c:  span_c * 2/3 })
background_light    = background.shift({ l:  span / 3,   c:  span_c / 3 })
background_dark     = background.shift({ l: -span / 3,   c: -span_c / 3 })
background_darker   = background.shift({ l: -span * 2/3, c: -span_c * 2/3 })
background_darkest  = background.shift({ l: -span,       c: -span_c })

// ── Identity — the logo, and the brightest color in the system ──
// No single brand mark color: a mid-lightness mark that clears both grounds
// scores ~4.30 / ~3.65, worse on BOTH than picking per ground (primary 7.06 on
// dark, background 13.5 on light). Ship two logos, like everyone else.
//
// cottontail is the one genuinely new identity color: the flash of a rabbit's
// tail and the light half of the lockup. Two spans above the text, or the ears
// stop reading on the disc. Chroma at 60% of the ceiling — contrast is flat
// from 60% to 92% (13.7–13.8 on the page), so the fraction is a look decision
// and 60% keeps headroom if the seed moves. Its 1.96 against primary is a LOGO
// allowance; WCAG exempts logotypes. Never set small text in it. The inline
// OKLCH is a ceiling probe, not a color: maxChroma() reads only lightness and
// hue.
top        = foreground.l + span * 2
cottontail = primary.atLightness(top).atChroma(OKLCH(top, 0, primary.h).maxChroma() * 0.60)

// ── Proof ──
d_body     = foreground.srgb.contrastWCAG(background)
d_worst    = min(
  foreground.srgb.contrastWCAG(background_lightest), tertiary.srgb.contrastWCAG(background_lightest),
  secondary.srgb.contrastWCAG(background_lightest),  primary.srgb.contrastWCAG(background_lightest),
  accent.srgb.contrastWCAG(background_lightest),     success.srgb.contrastWCAG(background_lightest),
  warning.srgb.contrastWCAG(background_lightest),    error.srgb.contrastWCAG(background_lightest),
  info.srgb.contrastWCAG(background_lightest)
)
d_contract = d_worst >= 4.5

// ═══════════════════════════════════════════════════════════════════════════
//  LIGHT MODE — same pattern, own hues
// ═══════════════════════════════════════════════════════════════════════════
//
// Derived from dark: the page sits at `top`, the top of the dark system, at the
// seed's own gamut fraction `tint`; the text carries the luminance an 8:1 body
// demands. Both reaches of the ladder use dark's inversion, mirrored — the page
// is the lighter side, so the target multiplies where dark's divides.
//
// What paper cannot mirror is "everything at the text's lightness". At L 0.40
// the sRGB gamut is about half as wide as at dark's 0.745: every brand color
// came out brown, grey or olive, and the contract that costs dark nothing cost
// light every color. So on paper the contract splits by role — the text is
// legible on every shade; brand and states on the page and the surface, with
// WCAG's 3:1 non-text floor below — and the brand sits at its own solved
// lightness, above the text.
//
// The page hue is the midpoint of the two hues dark is built around, the
// text's (also accent's) and the primary's — the only two candidates for a
// light primary on a warm ground. The page used to have to choose: a green
// reads as paper below hue 82, an orange above it. At the midpoint the page is
// 36° from each, the furthest a hue between them can be from both, so neither
// reads as paper (12.8 ΔE for the orange against the page's darkened form,
// 11.8 for the green) and the relationship decides. The complement wins, and
// the complement is orange.
light_bh         = (foreground.h + primary.h) / 2
tint             = background.c / background.maxChroma()
light_background = OKLCH(top, OKLCH(top, 0, light_bh).maxChroma() * tint, light_bh)

// The text sits on the page's complement at exactly the luminance an 8:1 body
// demands — past AAA with margin, and darker than dark's inherited 6.92 on
// purpose: the text alone sizes the ladder, so its body ratio is also the
// depth. setLuminance moves along the page's chromaticity, so the probe
// answers only "which lightness carries that luminance on this hue"; the
// chroma is then stated, the seed's, as in dark.
light_foreground = OKLCH(
  light_background.complement().xyy.setLuminance(
    (light_background.srgb.luminance + 0.05) / 8 - 0.05
  ).ok_l,
  background.c,
  (light_bh + 180) % 360
)

// ── Light ladder — one chroma rule, two reaches, the page in the middle ──
// Dark's rule is "chroma in proportion to lightness"; below the cusp that is
// the same as holding a fixed fraction of the sRGB boundary. Above the cusp —
// where the page is — only the second reading survives: proportional chroma
// stays nearly flat (the shades blended) while the boundary collapses to
// nothing at white. So every rung holds the seed's gamut fraction `tint` of the
// chroma available at ITS lightness, and the page is that formula's middle
// rung, as the seed is in dark.
//
// Two reaches, neither chosen. Up, the limit is a wall: white, where maxChroma
// is zero and the top rung comes out tintless on its own. Down, the limit is
// the contract: the ladder descends until the text reads `legible`, the mirror
// of dark's `span`. Steps 3.2 · 2.9 · 2.7 above, 8.3 · 6.1 · 4.9 below — the
// page sits near white, so the only depth a light ladder can have is below it.
light_span = top - light_background.xyy.setLuminance(legible * (light_foreground.srgb.luminance + 0.05) - 0.05).ok_l
light_up   = 1 - top

light_background_lightest = OKLCH(top + light_up,         OKLCH(top + light_up,         0, light_bh).maxChroma() * tint, light_bh)
light_background_lighter  = OKLCH(top + light_up * 2/3,   OKLCH(top + light_up * 2/3,   0, light_bh).maxChroma() * tint, light_bh)
light_background_light    = OKLCH(top + light_up / 3,     OKLCH(top + light_up / 3,     0, light_bh).maxChroma() * tint, light_bh)
light_background_dark     = OKLCH(top - light_span / 3,   OKLCH(top - light_span / 3,   0, light_bh).maxChroma() * tint, light_bh)
light_background_darker   = OKLCH(top - light_span * 2/3, OKLCH(top - light_span * 2/3, 0, light_bh).maxChroma() * tint, light_bh)
light_background_darkest  = OKLCH(top - light_span,       OKLCH(top - light_span,       0, light_bh).maxChroma() * tint, light_bh)

// ── Light brand — the same rank ladder, refitted to paper ──
// Dark's quantum is its seed's chroma. Light's seed is the page, so its quantum
// is the page's chroma; the ranks are dark's. Not one hue is a literal: primary
// sits on foreground.h — the seed's complement, the angle dark's accent takes —
// accent keeps dark's 72° from primary on the other side, and the rest are
// midpoints.
//
// Lightness is SOLVED, against the surface: the brand sits where its loudest
// color still reads `legible` on `light_background_dark`. Two solves, because
// luminance depends on hue. `light_nl` is where a color on the page's own
// chromaticity reads legible — where a neutral would sit. Green carries more
// luminance per unit of lightness than any hue (h_success is the sRGB green
// primary's own angle), so a rank-6 green is the loudest thing in the set;
// `light_bl` reruns the solve on that probe, placed at the neutral's answer so
// its chroma survives the rescale. Everything colorful shares that lightness.
//
// tertiary is rank 1 on the midpoint of the text and accent hues — 36° from
// each, dark's "furthest from both walls" rule, in the one arc a warm page
// leaves open. 9.5 ΔE from the text; at the text's own lightness it read 3.7.
light_u  = light_background.c
light_y  = (light_background_dark.srgb.luminance + 0.05) / legible - 0.05
light_nl = light_background_dark.xyy.setLuminance(light_y).ok_l
light_bl = OKLCH(light_nl, light_u * 6, h_success).xyy.setLuminance(light_y).ok_l

light_primary   = OKLCH(light_bl, light_u * 3, foreground.h).gamutMap()
light_accent    = OKLCH(light_bl, light_u * 4, (foreground.h - 72 + 360) % 360).gamutMap()
// primary + 180 would land on info, so secondary takes the centre of the legal
// teal arc — the midpoint of success and info, 50° clear of both.
light_secondary = OKLCH(light_bl, light_u * 2, (h_success + h_info) / 2).gamutMap()
light_tertiary  = OKLCH(light_bl, light_u,     (light_foreground.h + light_accent.h) / 2).gamutMap()

// warning cannot keep dark's 70: it sits 16° off the page. The midpoint of the
// page and success clears both by 26.8° — a green-gold, forced not chosen.
// Rank 6 sits above the sRGB ceiling on that hue and on info's, so for those
// two rank 6 means the ceiling: gamutMap holds lightness and hue and gives up
// the chroma that does not fit.
light_success = OKLCH(light_bl, light_u * 6, h_success).gamutMap()
light_warning = OKLCH(light_bl, light_u * 6, (light_bh + h_success) / 2).gamutMap()
light_error   = OKLCH(light_bl, light_u * 6, h_error).gamutMap()
light_info    = OKLCH(light_bl, light_u * 6, h_info).gamutMap()

// ── Light identity ──
// Dark cottontail pops by being brighter than everything; on paper that route
// is closed, so the light twin pops by CHROMA — full ceiling, two up-strides
// above the text, the offset dark's `top` takes from its own text. The up
// stride, not the solved one: two of those would lift it past the page's
// non-text floor. Here it clears 3:1 on every rung (3.08 on the darkest) and
// AA on the page (5.43). Boxed in: the brand sits 0.03 below it, the darkest
// rung's floor just above — primary's louder twin, not a color of its own.
// UI only: focus rings, markers, chart highlights. The mark's pale ears stay
// `cottontail` in both modes; only the disc themes.
light_cottontail = light_primary
  .atLightness(light_foreground.l + light_up * 2)
  .atChroma(OKLCH(light_foreground.l + light_up * 2, 0, foreground.h).maxChroma())

// ── Proof — the contract, one line per part ──
l_body     = light_foreground.srgb.contrastWCAG(light_background)
l_text     = light_foreground.srgb.contrastWCAG(light_background_darkest)
l_brand    = min(
  light_primary.srgb.contrastWCAG(light_background_dark), light_tertiary.srgb.contrastWCAG(light_background_dark),
  light_accent.srgb.contrastWCAG(light_background_dark),  light_secondary.srgb.contrastWCAG(light_background_dark),
  light_success.srgb.contrastWCAG(light_background_dark), light_warning.srgb.contrastWCAG(light_background_dark),
  light_error.srgb.contrastWCAG(light_background_dark),   light_info.srgb.contrastWCAG(light_background_dark)
)
l_floor    = min(
  light_primary.srgb.contrastWCAG(light_background_darkest), light_tertiary.srgb.contrastWCAG(light_background_darkest),
  light_accent.srgb.contrastWCAG(light_background_darkest),  light_secondary.srgb.contrastWCAG(light_background_darkest),
  light_success.srgb.contrastWCAG(light_background_darkest), light_warning.srgb.contrastWCAG(light_background_darkest),
  light_error.srgb.contrastWCAG(light_background_darkest),   light_info.srgb.contrastWCAG(light_background_darkest)
)
l_contract = l_text >= 4.5 && l_brand >= 4.5 && l_floor >= 3
// Widest step over narrowest. The down strides are about three times the up
// ones — the depth trade — so this sits near 3.0 while each side on its own
// tapers monotonically.
l_step1 = deltaE(light_background_lightest, light_background_lighter)
l_step2 = deltaE(light_background_lighter,  light_background_light)
l_step3 = deltaE(light_background_light,    light_background)
l_step4 = deltaE(light_background,          light_background_dark)
l_step5 = deltaE(light_background_dark,     light_background_darker)
l_step6 = deltaE(light_background_darker,   light_background_darkest)
l_even  = max(l_step1, l_step2, l_step3, l_step4, l_step5, l_step6) /
          min(l_step1, l_step2, l_step3, l_step4, l_step5, l_step6)

roles {
  background  = light_background
  surface     = light_background_dark
  border      = light_background_darker
  fg          = light_foreground
  primary     = light_primary
  primaryFg   = light_background
  secondary   = light_secondary
  secondaryFg = light_background
  tertiary    = light_tertiary
  tertiaryFg  = light_background
  accent      = light_accent
  accentFg    = light_background

  dark {
    background  = background
    surface     = background_light
    border      = background_lightest
    fg          = foreground
    primary     = primary
    primaryFg   = background
    secondary   = secondary
    secondaryFg = background
    tertiary    = tertiary
    tertiaryFg  = background
    accent      = accent
    accentFg    = background
  }
}

tokens {
  text   = text(15, 1.25)
  space  = space(4)
  radius = radius(8)
  font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })
}

component {
  buttons = button({
    variants: [
      { name: "primary",   bg: "primary",   fg: "primary-fg" },
      { name: "secondary", bg: "secondary", fg: "secondary-fg" },
      { name: "accent",    bg: "accent",    fg: "accent-fg" },
      { name: "tertiary",  bg: "tertiary",  fg: "tertiary-fg" },
      { name: "ghost",     bg: "bg",        fg: "fg", border: "fg/67" }
    ],
    sizes: [
      { name: "sm", padY: "1", padX: "3", text: "sm" },
      { name: "md", padY: "2", padX: "4", text: "base" },
      { name: "lg", padY: "3", padX: "5", text: "lg" }
    ],
    states: ["default", "hover", "active", "disabled"]
  })
  panel    = card({ bg: "surface", fg: "fg", radius: "lg", pad: "6", border: "fg/67", title: "Revenue" })
  headings = type([
    { text: "2xl", weight: "bold",     sample: "lilBunnyRabbit" },
    { text: "lg",  weight: "semibold", sample: "This month" },
    { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." },
    { text: "sm",  sample: "Muted caption / table cell" }
  ])
}

preview {
  ui_d      = ui(background, foreground, primary)
  ui_l      = ui(light_background, light_foreground, light_primary)
  logo_d    = pair(cottontail, primary)
  logo_l    = pair(cottontail, light_primary)
  shades_d  = palette(background_lightest, background_lighter, background_light, background, background_dark, background_darker, background_darkest)
  shades_l  = palette(light_background_lightest, light_background_lighter, light_background_light, light_background, light_background_dark, light_background_darker, light_background_darkest)
  brand_d   = palette(tertiary, secondary, primary, accent)
  brand_l   = palette(light_tertiary, light_secondary, light_primary, light_accent)
  states_d  = palette(success, warning, error, info)
  states_l  = palette(light_success, light_warning, light_error, light_info)
  text_d    = pair(foreground, background)
  text_l    = pair(light_foreground, light_background)
  pop_d     = pair(cottontail, background)
  pop_l     = pair(light_cottontail, light_background)
  surface_l = pair(light_primary, light_background_dark)
  deepest_l = pair(light_primary, light_background_darkest)
}
```
